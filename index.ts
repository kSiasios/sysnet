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
