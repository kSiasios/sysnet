# Network Actions - NPM Package

[![npm version](https://badge.fury.io/js/sysnet.svg)](https://www.npmjs.com/package/sysnet)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

`sysnet` is a simple and powerful npm package that allows users to perform common network actions such as connecting to or disconnecting from a WiFi network, configuring static IP addresses, enabling DHCP, and more. This package is designed to make managing network settings in Node.js environments straightforward and cross-platform.

## Features

- Connect to a WiFi network
- Disconnect from a WiFi network
- Configure static IP address
- Enable and disable DHCP
- Check network interface status
- Retrieve network configuration details
- Support for multiple network interfaces

## Installation

To install the `sysnet` package, run the following command:

```bash
npm install sysnet
```

## Usage

Here's a quick example of how you can use the `sysnet` package:

```javascript
const sysnet = require("sysnet");

// Connect to a WiFi network
sysnet
  .connectToWiFi("MyNetworkSSID", "password123")
  .then(() => console.log("Connected to WiFi"))
  .catch((error) => console.error("Error connecting to WiFi:", error));

// Disconnect from a WiFi network
sysnet
  .disconnectFromWiFi()
  .then(() => console.log("Disconnected from WiFi"))
  .catch((error) => console.error("Error disconnecting from WiFi:", error));

// Configure a static IP address
sysnet
  .configureStaticIP("192.168.1.100", "255.255.255.0", "192.168.1.1")
  .then(() => console.log("Static IP configured"))
  .catch((error) => console.error("Error configuring static IP:", error));

// Enable DHCP
sysnet
  .enableDHCP()
  .then(() => console.log("DHCP enabled"))
  .catch((error) => console.error("Error enabling DHCP:", error));
```

## API Reference

### `getStatus()`

Retrieves the current status and which of the network interfaces are being used on the system.

- **Returns:** An object containing the status as a bollean value and an array of interface names:

```javascript
{
  connected: Boolean;
  interfaces: Array<string>;
}
```

### `getInterfaces()`

Retrieves the details of the network interfaces on the system as reported by the OS.

- **Returns:** An array of objects containing the details of each interface.

### `getConnections()`

Retrieves all the connections as reported by the OS.

- **Returns:** An array of objects containing the connections and their details:

```javascript
// example
[
  {
    name: "Wi-Fi",
    state: "Disconnected",
    type: "Dedicated",
    adminState: "Enabled",
  },
  {
    name: "Ethernet",
    state: "Connected",
    type: "Dedicated",
    adminState: "Enabled",
  },
];
```

### `connectToWiFi(ssid, password)`

Connects to a WiFi network using the provided SSID and password.

- **Parameters:**

  - `ssid` (string): The name (SSID) of the WiFi network.
  - `password` (string): The password for the WiFi network.

- **Returns:** An object containing the status of the request and the error message:

```javascript
{
  success: boolean;
  error: "no-error" | "unknown-error";
}
```

### `disconnectFromWiFi()`

Disconnects from WiFi (does **_not_** disable wifi adapter device).

- **Returns:** An object containing the status of the request:

```javascript
{
  success: true | false;
}
```

### `scanWiFi()`

Retrieves the currently available WiFi networks.

- **Returns:** An array of objects containing the networks along with their details. The networks are sorted in descending order by their signal strength:

```javascript
{
  ssid: string;
  type: string;
  authentication: string;
  encryption: string;
  mac: string;
  signal: number;
  radioType: string;
  band: string;
  channel: number;
  basicRates: Array<string>;
  otherRates: Array<string>;
}
```

## Error Handling

Each function returns a promise that either resolves on success or rejects with an error. You can handle these errors using `.catch()` or `try-catch` with `async`/`await` in your code.

Example:

```javascript
async function setupNetwork() {
  try {
    const { success, error } = await sysnet.connectToWiFi(
      "MyNetworkSSID",
      "password123"
    );
    if (success) {
      console.log("Connected to WiFi");
      return;
    }
    cnsole.error(error);
  } catch (error) {
    console.error("Failed to connect:", error);
  }
}

setupNetwork();
```

## Requirements

- Node.js version 12.0 or higher
- Administrative or root privileges for network operations (depending on the platform)

## Contributing

We welcome contributions to improve `sysnet`! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or fix: `git checkout -b feature-branch-name`.
3. Make your changes.
4. Commit your changes: `git commit -m 'Add new feature or fix'`.
5. Push to the branch: `git push origin feature-branch-name`.
6. Open a pull request with a detailed description of the changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Feel free to open an issue or submit a pull request if you encounter bugs or have ideas for new features!
