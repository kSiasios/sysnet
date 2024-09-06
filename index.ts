import os from "os";

export async function getInterfaces() {
  const response = await os.networkInterfaces();
  return response;
}
