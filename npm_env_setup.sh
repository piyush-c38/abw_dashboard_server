echo "Installing Node..."

# Install Node.js
echo "Installing Node.js..."
sudo tar -xJf "dependency_zips/node-v20.18.0-linux-x64.tar.xz" -C /opt/
sudo ln -sf /opt/node-v20.18.0-linux-x64/bin/* /usr/local/bin/

echo "NodeJS installed!"
echo "Using Node.js version: $(node --version)"

# Install project dependencies for server
echo "Installing server dependencies..."
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

echo "Npm environment is Setup Now."

# Compress the entire ABW_DASHBOARD_SERVER directory
echo "Compressing the project directory..."
cd ..
tar -czf EMP_506_setup.tar.gz abw_dashboard_server/
echo "Project compressed as EMP_506_setup.tar.gz"