import { execSync } from "child_process";
import os from "os";
import fs from "fs";
import { create } from "xmlbuilder2";
import path from "path";

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
    connected: false,
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

export async function connectToNetwork(
  ssid: string,
  password: string,
  maxIterations: number = 50
) {
  try {
    const profileName = ssid;
    const profileXml = create({ version: "1.0" })
      .ele("WLANProfile", {
        xmlns: "http://www.microsoft.com/networking/WLAN/profile/v1",
      })
      .ele("name")
      .txt(profileName)
      .up()
      .ele("SSIDConfig")
      .ele("SSID")
      .ele("name")
      .txt(ssid)
      .up()
      .up()
      .ele("nonBroadcast")
      .txt("false")
      .up()
      .up()
      .ele("connectionType")
      .txt("ESS")
      .up()
      .ele("connectionMode")
      .txt("auto")
      .up()
      .ele("MSM")
      .ele("security")
      .ele("authEncryption")
      .ele("authentication")
      .txt("WPA2PSK")
      .up()
      .ele("encryption")
      .txt("AES")
      .up()
      .ele("useOneX")
      .txt("false")
      .up()
      .up()
      .ele("sharedKey")
      .ele("keyType")
      .txt("passPhrase")
      .up()
      .ele("protected")
      .txt("false")
      .up()
      .ele("keyMaterial")
      .txt(password)
      .up()
      .up()
      .up()
      .up()
      .up();

    const profilePath = path.join(__dirname, `${profileName}.xml`);
    fs.writeFileSync(profilePath, profileXml.toString());

    await execSync(`netsh wlan add profile filename="${profilePath}"`, {
      encoding: "utf-8",
    });
    await execSync(`netsh wlan connect name="${ssid}"`, {
      encoding: "utf-8",
    });

    let conn = (await getConnections()).filter(
      (conn) => conn.name === "Wi-Fi"
    )[0];

    let iteration = 0;
    while (iteration <= maxIterations && conn.state !== "Connected") {
      conn = (await getConnections()).filter(
        (conn) => conn.name === "Wi-Fi"
      )[0];
      iteration++;
    }

    if (conn.state === "Connected") {
      return { success: true, error: "no-error" };
    }

    if (conn.state === "Connecting") {
      return { success: false, error: "connecting" };
    }

    return { success: false, error: "unknown-error" };
  } catch (error) {
    return { success: false, error: "unknown-error" };
  }
}

export function getConnections() {
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

  const resultMatrix = matrix.filter((line) => line.length > 1).slice(1);

  // console.log(resultMatrix);
  // console.log(resultMatrix);

  interface ConnectionsResponse {
    name: string;
    state: string;
    type: string;
    adminState: string;
  }

  const response: Array<ConnectionsResponse> = [];

  resultMatrix.forEach((line) => {
    // if (line.includes("Connected")) {
    response.push({
      name: line[3],
      state: line[1],
      type: line[2],
      adminState: line[0],
    });
    // }
  });

  return response;
}
