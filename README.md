# ABW Dashboard Server

A comprehensive MQTT-based dashboard application for monitoring and data visualization, designed for air-gapped systems.

## Overview

This application consists of:
- **Backend Server**: Node.js API server with MQTT integration and SQLite database
- **Frontend Dashboard**: Next.js web application for data visualization
- **MQTT Broker**: Mosquitto for real-time data communication
- **Database**: SQLite for data storage

## System Requirements

- **Operating System**: Ubuntu 22.04 LTS or compatible Linux distribution
- **Architecture**: x64 (64-bit)
- **Disk Space**: Minimum 2GB free space
- **Memory**: Minimum 4GB RAM recommended
- **Network**: Internet connection for initial setup (not required for air-gapped deployment)

## Installation Instructions

### Step 1: Prepare the Setup Package (Internet-Connected System)

1. Clone or download the source file from this GitHub repository.
2. Extract the source zip file to the Desktop.
3. Open the extracted folder and run the ```npm_env_setup.sh``` file as a program (follow the instructions in the "How to Run Scripts as Programs" section in this README).
4. This will create a zip named ```EMP_506_setup.tar.gz``` on your Desktop (one level up from the project folder).
5. Transfer this zip file to the air-gapped system.

### Step 2: Setup on Air-Gapped System

1. Extract this file on the desktop.
2. Open the extracted folder and run the ```install_and_setup.sh``` file as a program (follow the instructions in the "How to Run Scripts as Programs" section in this README).
3. An ```App.desktop``` file will be created on the desktop, currently with a cross symbol on it.
4. Right-click this file and click "Allow launching".
5. The file will be active renamed as ```ABW Dashboard```.

### Step 4: Launch the Application

Double-click the `ABW Dashboard` icon to start the ABW Dashboard application.

## How to Run Scripts as Programs

### Method 1: Using File Manager (Recommended)
1. Right-click on the script file (`.sh`)
2. Click on ```Run as a Program``` to execute the program.

### Method 2: Using Terminal
```bash
chmod +x script_name.sh
./script_name.sh
```


## Important Notes

⚠️ **File Location Warning**: All files must remain in their original locations. Moving or renaming directories may cause the application to malfunction.

✅ **Network Requirements**: 
- Internet connection required only for initial package preparation
- Air-gapped system needs no internet connection

🔧 **Troubleshooting**:
- Ensure all scripts have execute permissions
- Check system logs if services fail to start
- Verify Node.js installation: `node --version`
- Check Mosquitto status: `sudo systemctl status mosquitto`

## Support

For issues or questions, please refer to the project repository or contact the development team.

---
*Last updated: July 2025*