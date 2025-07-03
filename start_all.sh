#!/bin/bash
# Portable startup script for ABW Dashboard
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion"

# Use Node 20 if available, otherwise use default
if command -v nvm &> /dev/null; then
    nvm use 20 2>/dev/null || echo "Node 20 not available, using default Node version"
fi

# Change to script directory
cd "$(dirname "$0")"

# Start subscriber in background and log output
node server/subscriber.js > subscriber.log 2>&1 &

# Start API server in background and log output
node server/api.js > api.log 2>&1 &

# Start frontend in background and log output
cd dashboard
npm run dev > ../frontend.log 2>&1 &

# Open the browser to localhost:3000 after a short delay
sleep 3
xdg-open http://localhost:3000 > /dev/null 2>&1

# Keep the script running so background processes stay alive
echo "All services started. Press Ctrl+C to stop."
tail -f /dev/null