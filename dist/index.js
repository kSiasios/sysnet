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
exports.getStatus = exports.getInterfaces = void 0;
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
function getInterfaces() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield os_1.default.networkInterfaces();
        return response;
    });
}
exports.getInterfaces = getInterfaces;
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
exports.getStatus = getStatus;
