# Shell Script file

```sh
#!/bin/bash
cd "$(dirname "$0")"

# Start subscriber in background and log output
node mqtt-subscriber/subscriber.js > subscriber.log 2>&1 &

# Start API server in background and log output
node mqtt-subscriber/api.js > api.log 2>&1 &
``
# Start frontend in background and log output
cd abw_dashboard
npm run dev > ../frontend.log 2>&1 &

# Open the browser to localhost:3000 after a short delay
sleep 3
xdg-open http://localhost:3000

# Keep the script running so background processes stay alive
echo "All services started. Press Ctrl+C to stop."
tail -f /dev/null
```

# Desktop file

```desktop
[Desktop Entry]
Type=Application
Terminal=true
Name=Start EMP506 Project
Exec= #Enter file location
```