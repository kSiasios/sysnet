"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterfaces = getInterfaces;
exports.getStatus = getStatus;
exports.scanWiFi = scanWiFi;
exports.connectToNetwork = connectToNetwork;
exports.getConnections = getConnections;
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const xmlbuilder2_1 = require("xmlbuilder2");
const path_1 = __importDefault(require("path"));
function getInterfaces() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield os_1.default.networkInterfaces();
        return response;
    });
}
function getStatus() {
    const result = (0, child_process_1.execSync)("netsh interface show interface", {
        encoding: "utf-8",
    });
    const lines = result.split(/\r*\n/).filter((line) => line !== "");
    const matrix = new Array();
    lines.forEach((line) => {
        const splitLine = line
            .split("  ")
            .filter((elem) => elem !== "")
            .map((cell) => cell.trim());
        matrix.push(splitLine);
    });
    const resultMatrix = matrix.filter((line) => line.length > 1);
    const response = {
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
function scanWiFi() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (0, child_process_1.execSync)("netsh wlan show networks mode=Bssid", {
            encoding: "utf-8",
        });
        const lines = result
            .split(/\r*\n/)
            .filter((line) => line !== "" && line !== " ");
        const networks = [];
        let netProps = {
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
                netProps.signal = parseInt(lines[index + 5].split(" : ")[1].replace("%", ""));
                netProps.radioType = lines[index + 6].split(" : ")[1];
                netProps.band = lines[index + 7].split(" : ")[1];
                netProps.channel = parseInt(lines[index + 8].split(" : ")[1]);
                netProps.basicRates = lines[index + 9].split(" : ")[1].split(" ");
                netProps.otherRates = lines[index + 10].split(" : ")[1].split(" ");
                networks.push(Object.assign({}, netProps));
                index += 10;
            }
        }
        return networks.sort((a, b) => b.signal - a.signal);
    });
}
function connectToNetwork(ssid_1, password_1) {
    return __awaiter(this, arguments, void 0, function* (ssid, password, maxIterations = 50) {
        try {
            const profileName = ssid;
            const profileXml = (0, xmlbuilder2_1.create)({ version: "1.0" })
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
            const profilePath = path_1.default.join(__dirname, `${profileName}.xml`);
            fs_1.default.writeFileSync(profilePath, profileXml.toString());
            yield (0, child_process_1.execSync)(`netsh wlan add profile filename="${profilePath}"`, {
                encoding: "utf-8",
            });
            yield (0, child_process_1.execSync)(`netsh wlan connect name="${ssid}"`, {
                encoding: "utf-8",
            });
            let conn = (yield getConnections()).filter((conn) => conn.name === "Wi-Fi")[0];
            let iteration = 0;
            while (iteration <= maxIterations && conn.state !== "Connected") {
                conn = (yield getConnections()).filter((conn) => conn.name === "Wi-Fi")[0];
                iteration++;
            }
            if (conn.state === "Connected") {
                return { success: true, error: "no-error" };
            }
            if (conn.state === "Connecting") {
                return { success: false, error: "connecting" };
            }
            return { success: false, error: "unknown-error" };
        }
        catch (error) {
            return { success: false, error: "unknown-error" };
        }
    });
}
function getConnections() {
    const result = (0, child_process_1.execSync)("netsh interface show interface", {
        encoding: "utf-8",
    });
    const lines = result.split(/\r*\n/).filter((line) => line !== "");
    const matrix = new Array();
    lines.forEach((line) => {
        const splitLine = line
            .split("  ")
            .filter((elem) => elem !== "")
            .map((cell) => cell.trim());
        matrix.push(splitLine);
    });
    const resultMatrix = matrix.filter((line) => line.length > 1).slice(1);
    const response = [];
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
