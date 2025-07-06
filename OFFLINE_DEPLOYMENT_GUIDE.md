# 🚀 ABW Dashboard Offline Deployment Guide

This guide helps you create a complete offline package for deployment to air-gapped/secure systems.

## 📋 Prerequisites (On Connected System)

1. **Linux system with internet** (for creating the package)
2. **Node.js 20** installed
3. **npm** installed
4. **curl** or **wget** for downloading

## 🔧 Step 1: Create Offline Package (Connected System)

### Run the package creation script:
```bash
chmod +x create_offline_package.sh
./create_offline_package.sh
```

### Manual steps for complete offline capability:

1. **Download Mosquitto packages** (Ubuntu/Debian):
```bash
# Navigate to the package directory
cd abw_dashboard_offline_package/mosquitto_packages/

# Method 1: Download specific packages (may need version updates)
wget http://archive.ubuntu.com/ubuntu/pool/universe/m/mosquitto/mosquitto_2.0.11-1ubuntu1_amd64.deb
wget http://archive.ubuntu.com/ubuntu/pool/universe/m/mosquitto/mosquitto-clients_2.0.11-1ubuntu1_amd64.deb

# Method 2: Use apt-get download (recommended - gets correct dependencies automatically)
# This method downloads packages without installing them
sudo apt update
apt-get download mosquitto mosquitto-clients

# Method 3: Download all dependencies recursively (most comprehensive)
mkdir -p temp_deps
cd temp_deps
apt-get download mosquitto mosquitto-clients $(apt-cache depends --recurse --no-recommends --no-suggests --no-conflicts --no-breaks --no-replaces --no-enhances mosquitto mosquitto-clients | grep "^\w" | sort -u)
mv *.deb ../
cd .. && rm -rf temp_deps

# Note: If libssl errors occur, skip it as it's usually already installed on target systems
# or download the correct version:
# apt-cache search libssl | grep libssl1.1  # Find correct version
# apt-get download libssl1.1  # Download the version that exists
```

2. **Create the final package**:
```bash
cd ..
tar -czf abw_dashboard_complete_offline.tar.gz abw_dashboard_offline_package/
```

## 📦 Step 2: Transfer to Target System

1. **Copy to USB/Pendrive**:
```bash
cp abw_dashboard_complete_offline.tar.gz /media/usb/
```

2. **Transfer files to target system**

## 🖥️ Step 3: Install on Target System (Offline)

### Extract and install:
```bash
# Extract the package
tar -xzf abw_dashboard_complete_offline.tar.gz
cd abw_dashboard_offline_package/

# Run the offline installer
chmod +x offline_install.sh
./offline_install.sh
```

### Start the application:
```bash
./start_portable.sh
```

## 🌟 Features of Offline Package

### ✅ **Complete Self-Contained**
- Portable Node.js runtime (no system Node.js required)
- Pre-installed npm dependencies
- MQTT broker packages
- Application code

### ✅ **Easy Deployment**
- Single script installation
- Desktop launcher creation
- Automatic service startup

### ✅ **No Internet Required**
- All dependencies bundled
- Works in air-gapped environments
- No external API calls

## 📁 Package Structure

```
abw_dashboard_offline_package/
├── nodejs/                     # Portable Node.js v20
│   ├── bin/
│   │   ├── node
│   │   └── npm
│   └── ...
├── dashboard/                  # Frontend Next.js app
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
├── server/                     # Backend Node.js API
│   ├── api.js
│   ├── subscriber.js
│   ├── variable.js
│   └── package.json
├── mosquitto_packages/         # MQTT broker .deb files
├── dashboard_node_modules.tar.gz
├── server_node_modules.tar.gz
├── offline_install.sh          # Installation script
├── start_portable.sh           # Startup script
└── INSTALLATION_SUMMARY.md     # Instructions
```

## 🔧 Alternative Deployment Methods

### **Option A: Docker Container** (if Docker is available)
```dockerfile
FROM node:20-alpine
# Copy application and run
```

### **Option B: AppImage** (Linux portable executable)
- Single file executable
- No installation required
- Runs on any Linux system

### **Option C: Electron App** (Cross-platform desktop app)
- Windows, macOS, Linux support
- Self-contained executable
- Native desktop experience

## 🛡️ Security Considerations

1. **Package Verification**: Verify checksums of downloaded packages
2. **Code Review**: Review all scripts before execution
3. **Minimal Privileges**: Run with minimal required permissions
4. **Network Isolation**: Ensure no outbound network calls

## 📊 System Requirements (Target System)

- **OS**: Ubuntu 18.04+ / Debian 9+ / RHEL 7+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB for application + data
- **Ports**: 3000 (frontend), 5000 (API), 1883 (MQTT)

## 🔍 Troubleshooting

### Package Download Issues:
1. **404 Not Found for packages**: Package versions change frequently
   ```bash
   # Find available versions
   apt-cache search mosquitto
   apt-cache policy mosquitto
   
   # Download latest available version
   apt-get download mosquitto mosquitto-clients
   ```

2. **libssl dependency errors**: Usually already installed on target systems
   ```bash
   # Check what's available
   apt-cache search libssl1.1
   # Skip if not found - target system likely has it
   ```

3. **Permission denied downloading**: 
   ```bash
   # Ensure you have proper permissions
   sudo apt update
   # Or download to a writable directory
   ```

### Installation Issues:
1. **Permission denied**: `chmod +x *.sh`
2. **Port conflicts**: Change ports in configuration
3. **Missing dependencies**: Install libssl, sqlite3
4. **Service conflicts**: Stop conflicting services

### Runtime Issues:
1. **Node.js not found**: Check nodejs/bin/node exists and is executable
2. **npm command not found**: Use full path: ./nodejs/bin/npm
3. **Mosquitto connection failed**: 
   ```bash
   sudo systemctl status mosquitto
   sudo systemctl start mosquitto
   ```

### Log Files:
- `subscriber.log` - MQTT subscription logs
- `api.log` - API server logs  
- `frontend.log` - Frontend server logs

## 📞 Support

For issues or questions, check:
1. `INSTALLATION_SUMMARY.md` in the package
2. Log files for error details
3. System service status: `systemctl status mosquitto`

---

**🎯 This package enables complete offline deployment of the ABW Dashboard system to secure, air-gapped environments while maintaining full functionality.**
