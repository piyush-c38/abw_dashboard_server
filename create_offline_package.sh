#!/bin/bash
# create_offline_package.sh - Creates a complete offline deployment package

set -e

echo "🚀 Creating Offline Deployment Package for ABW Dashboard..."

# Create package directory
PACKAGE_DIR="abw_dashboard_offline_package"
mkdir -p "$PACKAGE_DIR"

# Copy application files
echo "📂 Copying application files..."
cp -r dashboard "$PACKAGE_DIR/"
cp -r server "$PACKAGE_DIR/"
cp *.sh "$PACKAGE_DIR/" 2>/dev/null || true
cp *.md "$PACKAGE_DIR/" 2>/dev/null || true
cp .gitignore "$PACKAGE_DIR/" 2>/dev/null || true

# Create portable Node.js directory
echo "📦 Downloading portable Node.js..."
NODE_VERSION="20.11.0"
NODE_ARCH="linux-x64"
NODE_PACKAGE="node-v${NODE_VERSION}-${NODE_ARCH}"

# Download Node.js if not already present
if [ ! -f "${NODE_PACKAGE}.tar.xz" ]; then
    curl -O "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_PACKAGE}.tar.xz"
fi

# Extract Node.js to package
tar -xf "${NODE_PACKAGE}.tar.xz"
mv "$NODE_PACKAGE" "$PACKAGE_DIR/nodejs"

# Install npm dependencies
echo "📥 Installing npm dependencies..."
cd dashboard
npm ci
cd ..

cd server
npm ci
cd ..

# Create node_modules tarballs
echo "🗜️  Creating node_modules archives..."
cd dashboard
tar -czf "../$PACKAGE_DIR/dashboard_node_modules.tar.gz" node_modules/
cd ..

cd server
tar -czf "../$PACKAGE_DIR/server_node_modules.tar.gz" node_modules/
cd ..

# Download Mosquitto packages (for Ubuntu/Debian)
echo "🦟 Downloading Mosquitto packages..."
mkdir -p "$PACKAGE_DIR/mosquitto_packages"

# Try to download using apt-get (recommended method)
if command -v apt-get &> /dev/null; then
    echo "📦 Using apt-get to download packages (includes dependencies)..."
    cd "$PACKAGE_DIR/mosquitto_packages"
    
    # Update package list
    sudo apt update || echo "⚠️  Could not update package list"
    
    # Download mosquitto packages with dependencies
    apt-get download mosquitto mosquitto-clients 2>/dev/null || {
        echo "⚠️  apt-get download failed, you may need to manually download packages"
        echo "Run these commands in the mosquitto_packages directory:"
        echo "  sudo apt update"
        echo "  apt-get download mosquitto mosquitto-clients"
    }
    
    cd - > /dev/null
else
    echo "⚠️  apt-get not available. Mosquitto packages need to be manually downloaded."
fi

echo "💡 Note: If automatic download fails, manually run these commands:"
echo "   cd $PACKAGE_DIR/mosquitto_packages/"
echo "   sudo apt update"
echo "   apt-get download mosquitto mosquitto-clients"

echo "✅ Offline package created successfully in $PACKAGE_DIR/"
