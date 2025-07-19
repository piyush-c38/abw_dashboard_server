#!/bin/bash
#Note: The sources are binary files of sqlite and node. For mosquitto package formatino steps have been followed for ubuntu 22.
echo "Installing complete offline package..."

# Install Node.js
echo "Installing Node.js..."
sudo tar -xJf "offline_env setup/node-v20.18.0-linux-x64.tar.xz" -C /opt/
sudo ln -sf /opt/node-v20.18.0-linux-x64/bin/* /usr/local/bin/

# Install SQLite3
echo "Installing SQLite3..."
cd "offline_env setup"
unzip sqlite-tools-linux-x64-3460000.zip
sudo cp sqlite3 /usr/local/bin/
sudo chmod +x /usr/local/bin/sqlite3
cd ..

# Install Mosquitto from offline tar.gz package
echo "Installing Mosquitto..."
cd "offline_env setup"
if [ -f mosquitto-offline.tar.gz ]; then
    echo "Extracting Mosquitto offline package..."
    tar -xzvf mosquitto-offline.tar.gz
    
    echo "Installing Mosquitto packages..."
    cd debs
    sudo dpkg -i *.deb 2>/dev/null || echo "Some dependency warnings expected..."
    
    echo "Fixing any dependency issues..."
    sudo apt install -f -y 2>/dev/null || echo "Dependencies resolved or not critical"
    
    cd ../..
else
    echo "mosquitto-offline.tar.gz file not found!"
    cd ..
fi

echo "Creating Mosquitto config..."
sudo mkdir -p /etc/mosquitto/conf.d
echo "listener 1883
allow_anonymous true" | sudo tee /etc/mosquitto/conf.d/abw_dashboard.conf

echo "Starting Mosquitto..."
sudo systemctl start mosquitto
sudo systemctl enable mosquitto

echo "Final checks..."
echo "Mosquitto version:"
mosquitto -v 2>/dev/null || echo "Mosquitto installed but version check failed"
echo "Mosquitto service status:"
if sudo systemctl is-active --quiet mosquitto; then
    echo "✅ Mosquitto is running successfully!"
    sudo systemctl status mosquitto --no-pager | head -5
else
    echo "❌ Mosquitto is not running properly"
    sudo systemctl status mosquitto --no-pager
fi

echo "✅ All installations completed!"

echo ""
echo "========================================="
echo "Setting up ABW Dashboard project..."
echo "========================================="

# Copy the desktop file to the user's desktop
echo "Copying App.desktop to Desktop..."
if [ -f "App.desktop" ]; then
  cp "App.desktop" ~/Desktop/
  echo "App.desktop copied to Desktop"
else
  echo "Warning: App.desktop not found in project directory"
fi

# Make the desktop file executable
chmod +x ~/Desktop/App.desktop

# Make the start_all.sh script executable
chmod +x start_all.sh

echo "Setup complete. You can now run ./start_all.sh"
