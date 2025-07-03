#!/bin/bash
# setup_env.sh - Script to install NVM, Node.js, and project dependencies

set -e

# Install Mosquitto MQTT broker and SQLite
echo "Updating system and installing Mosquitto and SQLite..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y mosquitto sqlite3

# Configure Mosquitto to allow anonymous access
MOSQ_CONF="/etc/mosquitto/conf.d/abw_dashboard.conf"
echo "listener 1883
allow_anonymous true" | sudo tee "$MOSQ_CONF" > /dev/null

sudo systemctl restart mosquitto
sudo systemctl enable mosquitto

# Install NVM if not already installed
if [ ! -d "$HOME/.nvm" ]; then
  echo "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Load NVM
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js version 20 if not already installed
if ! nvm ls 20 > /dev/null 2>&1; then
  echo "Installing Node.js v20..."
  nvm install 20
fi

nvm use 20

# Install project dependencies for server
echo "Installing server dependencies..."
cd "$(dirname "$0")"
if [ -d "server" ]; then
  cd server
  if [ -f package.json ]; then
    npm install
  fi
  cd ..
fi

# Install project dependencies for dashboard (frontend)
echo "Installing dashboard dependencies..."
if [ -d "dashboard" ]; then
  cd dashboard
  if [ -f package.json ]; then
    npm install
  fi
  cd ..
fi

# Make the desktop file executable
chmod +x ~/Desktop/App.desktop

# Make the start_all.sh script executable
chmod +x "$(dirname "$0")/start_all.sh"

echo "Setup complete. You can now run ./start_all.sh"
