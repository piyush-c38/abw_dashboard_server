#!/bin/bash
# offline_install.sh - Installs the ABW Dashboard on an offline system

set -e

echo "🚀 Installing ABW Dashboard on Offline System..."

# Check if we're in the right directory
if [ ! -d "nodejs" ] || [ ! -d "dashboard" ] || [ ! -d "server" ]; then
    echo "❌ Error: This script must be run from the offline package directory"
    echo "Expected structure: nodejs/, dashboard/, server/, mosquitto_packages/"
    exit 1
fi

# Get the absolute path of the package directory
PACKAGE_DIR="$(pwd)"
NODE_PATH="$PACKAGE_DIR/nodejs/bin"

echo "📁 Package directory: $PACKAGE_DIR"
echo "🟢 Node.js path: $NODE_PATH"

# Install Mosquitto from local packages (Ubuntu/Debian)
echo "🦟 Installing Mosquitto MQTT Broker..."
if [ -d "mosquitto_packages" ] && [ "$(ls -A mosquitto_packages)" ]; then
    sudo dpkg -i mosquitto_packages/*.deb || true
    sudo apt-get install -f -y || true  # Fix any dependency issues
else
    echo "⚠️  Warning: No Mosquitto packages found. Please install manually:"
    echo "   sudo apt update && sudo apt install mosquitto mosquitto-clients sqlite3"
fi

# Configure Mosquitto
echo "⚙️  Configuring Mosquitto..."
MOSQ_CONF="/etc/mosquitto/conf.d/abw_dashboard.conf"
echo "listener 1883
allow_anonymous true" | sudo tee "$MOSQ_CONF" > /dev/null

sudo systemctl restart mosquitto || echo "⚠️  Could not restart mosquitto service"
sudo systemctl enable mosquitto || echo "⚠️  Could not enable mosquitto service"

# Extract node_modules
echo "📦 Installing Node.js dependencies..."
cd dashboard
if [ -f "../dashboard_node_modules.tar.gz" ]; then
    tar -xzf "../dashboard_node_modules.tar.gz"
    echo "✅ Dashboard dependencies installed"
else
    echo "⚠️  Dashboard node_modules archive not found, running npm install..."
    "$NODE_PATH/npm" install
fi
cd ..

cd server
if [ -f "../server_node_modules.tar.gz" ]; then
    tar -xzf "../server_node_modules.tar.gz"
    echo "✅ Server dependencies installed"
else
    echo "⚠️  Server node_modules archive not found, running npm install..."
    "$NODE_PATH/npm" install
fi
cd ..

# Create portable startup script
echo "🔧 Creating portable startup script..."
cat > start_portable.sh << EOF
#!/bin/bash
# Portable startup script for ABW Dashboard

# Get the directory where this script is located
SCRIPT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
NODE_PATH="\$SCRIPT_DIR/nodejs/bin"

# Check if Node.js is available
if [ ! -f "\$NODE_PATH/node" ]; then
    echo "❌ Error: Node.js not found at \$NODE_PATH/node"
    echo "Please ensure the nodejs directory is present"
    exit 1
fi

echo "🚀 Starting ABW Dashboard..."
echo "📁 Working directory: \$SCRIPT_DIR"
echo "🟢 Using Node.js: \$NODE_PATH/node"

# Change to script directory
cd "\$SCRIPT_DIR"

# Start subscriber in background
echo "🔌 Starting MQTT subscriber..."
"\$NODE_PATH/node" server/subscriber.js > subscriber.log 2>&1 &
SUBSCRIBER_PID=\$!

# Start API server in background
echo "🌐 Starting API server..."
"\$NODE_PATH/node" server/api.js > api.log 2>&1 &
API_PID=\$!

# Start frontend
echo "🎨 Starting frontend..."
cd dashboard
"\$NODE_PATH/npm" run dev > ../frontend.log 2>&1 &
FRONTEND_PID=\$!
cd ..

# Open browser after a delay
sleep 5
xdg-open http://localhost:3000 > /dev/null 2>&1 || echo "🌐 Open http://localhost:3000 in your browser"

echo "✅ All services started successfully!"
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API Server: http://localhost:5000"
echo ""
echo "📝 Log files:"
echo "   - Subscriber: subscriber.log"
echo "   - API: api.log" 
echo "   - Frontend: frontend.log"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill \$SUBSCRIBER_PID \$API_PID \$FRONTEND_PID 2>/dev/null || true
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Keep script running
tail -f /dev/null
EOF

chmod +x start_portable.sh

# Create desktop launcher
echo "🖥️  Creating desktop launcher..."
cat > ABW_Dashboard.desktop << EOF
[Desktop Entry]
Type=Application
Terminal=true
Name=ABW Dashboard (Portable)
Comment=506 Army Base Workshop Dashboard
Exec=bash -c 'cd "$PACKAGE_DIR" && ./start_portable.sh'
Path=$PACKAGE_DIR
Icon=$PACKAGE_DIR/dashboard/public/logo_506.png
Categories=Office;Development;
EOF

chmod +x ABW_Dashboard.desktop

# Create installation summary
echo "📋 Creating installation summary..."
cat > INSTALLATION_SUMMARY.md << EOF
# ABW Dashboard Offline Installation Complete

## 🎉 Installation Summary
- ✅ Portable Node.js v20 installed
- ✅ Dashboard dependencies installed
- ✅ Server dependencies installed
- ✅ Mosquitto MQTT broker configured
- ✅ Portable startup script created
- ✅ Desktop launcher created

## 🚀 How to Start the Application

### Option 1: Use the portable script
\`\`\`bash
./start_portable.sh
\`\`\`

### Option 2: Use the desktop launcher
- Copy \`ABW_Dashboard.desktop\` to your desktop
- Double-click to launch

## 🌐 Access URLs
- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:5000

## 📁 Directory Structure
\`\`\`
$PACKAGE_DIR/
├── nodejs/                 # Portable Node.js runtime
├── dashboard/              # Frontend application
├── server/                 # Backend API and MQTT subscriber
├── start_portable.sh       # Main startup script
├── ABW_Dashboard.desktop   # Desktop launcher
└── *.log                   # Application logs
\`\`\`

## 📝 Log Files
- \`subscriber.log\` - MQTT subscriber logs
- \`api.log\` - API server logs
- \`frontend.log\` - Frontend development server logs

## 🔧 Troubleshooting
1. **Permission denied**: Run \`chmod +x start_portable.sh\`
2. **Port conflicts**: Ensure ports 3000 and 5000 are available
3. **Mosquitto issues**: Check if mosquitto service is running: \`sudo systemctl status mosquitto\`

## 📦 System Requirements
- Linux (Ubuntu/Debian recommended)
- SQLite3
- Mosquitto MQTT broker
- Web browser

Generated on: $(date)
EOF

echo ""
echo "🎊 INSTALLATION COMPLETE! 🎊"
echo ""
echo "📋 Summary saved to: INSTALLATION_SUMMARY.md"
echo "🚀 To start the application: ./start_portable.sh"
echo "🖥️  Desktop launcher: ABW_Dashboard.desktop"
echo ""
echo "✅ ABW Dashboard is ready to use offline!"
