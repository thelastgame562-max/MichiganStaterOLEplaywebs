import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const codesFile = path.resolve(__dirname, "../data/codes.json");

function readCodes() {
  return JSON.parse(fs.readFileSync(codesFile, "utf8"));
}

function writeCodes(codes) {
  fs.writeFileSync(codesFile, JSON.stringify(codes, null, 2));
}

export function getAllCodes() {
  return readCodes();
}

export function getCode(code) {
  return readCodes().find((entry) => entry.code === code.toUpperCase());
}

export function createCode(code, role, createdBy) {
  const codes = readCodes();
  const upperCode = code.toUpperCase();

  if (codes.some((entry) => entry.code === upperCode)) {
    throw new Error("Code already exists.");
  }

  const next = [...codes, { code: upperCode, role, createdBy }];
  writeCodes(next);
  return upperCode;
}

export function removeCode(code) {
  const upperCode = code.toUpperCase();
  const filtered = readCodes().filter((entry) => entry.code !== upperCode);
  writeCodes(filtered);
}
