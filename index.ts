import { execSync } from "child_process";
import os from "os";

export async function getInterfaces() {
  const response = await os.networkInterfaces();
  return response;
}

export function getStatus() {
  const result = execSync("netsh interface show interface", {
    encoding: "utf-8",
  });

  const lines = result.split(/\r*\n/).filter((line) => line !== "");

  const matrix = new Array<Array<string>>();

  lines.forEach((line) => {
    const splitLine = line
      .split("  ")
      .filter((elem) => elem !== "")
      .map((cell) => cell.trim());
    matrix.push(splitLine);
  });

  const resultMatrix = matrix.filter((line) => line.length > 1);

  interface StatusResponse {
    connected: Boolean;
    interfaces: Array<string>;
  }

  const response: StatusResponse = {
    connected: true,
    interfaces: [],
  };

  resultMatrix.forEach((line) => {
    if (line.includes("Connected")) {
      response.connected = true;
      response.interfaces.push(line[line.length - 1]);
    }
  });

  return response;
}

export async function scanWiFi() {
  const result = execSync("netsh wlan show networks mode=Bssid", {
    encoding: "utf-8",
  });

  const lines = result
    .split(/\r*\n/)
    .filter((line) => line !== "" && line !== " ");

  interface NetProps {
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

  const networks: Array<NetProps> = [];

  let netProps: NetProps = {
    ssid: "",
    type: "",
    authentication: "",
    encryption: "",
    mac: "",
    signal: 0,
    radioType: "",
    band: "",
    channel: -1,
    basicRates: [""],
    otherRates: [""],
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const [prop, value] = line.split(" : ");
    if (prop.includes("SSID")) {
      netProps.ssid = value;
      netProps.type = lines[index + 1].split(" : ")[1];
      netProps.authentication = lines[index + 2].split(" : ")[1];
      netProps.encryption = lines[index + 3].split(" : ")[1];
      netProps.mac = lines[index + 4].split(" : ")[1];
      netProps.signal = parseInt(
        lines[index + 5].split(" : ")[1].replace("%", "")
      );
      netProps.radioType = lines[index + 6].split(" : ")[1];
      netProps.band = lines[index + 7].split(" : ")[1];
      netProps.channel = parseInt(lines[index + 8].split(" : ")[1]);
      netProps.basicRates = lines[index + 9].split(" : ")[1].split(" ");
      netProps.otherRates = lines[index + 10].split(" : ")[1].split(" ");

      networks.push({ ...netProps });
      index += 10;
    }
  }

  return networks.sort((a: NetProps, b: NetProps) => b.signal - a.signal);
}
