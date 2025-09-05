import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { parse } from "jsonc-parser";

export const readJson = async (directory: string, file: string) =>
  JSON.parse(await fsp.readFile(path.join(directory, file), "utf-8"));

export const readJsonSync = (directory: string, file: string) =>
  JSON.parse(fs.readFileSync(path.join(directory, file), "utf-8"));

export const readJsonc = async (directory: string, file: string) =>
  parse(await fsp.readFile(path.join(directory, file), "utf-8"));

export const readJsoncSync = (directory: string, file: string) =>
  parse(fs.readFileSync(path.join(directory, file), "utf-8"));

export async function findDenoConfig(
  directory: string
): Promise<string | undefined> {
  try {
    if ((await fsp.stat(path.join(directory, "deno.json"))).isFile()) {
      return "deno.json";
    }
  } catch (err) {
    if (err && (err as { code: string }).code !== "ENOENT") {
      throw err;
    }
  }

  try {
    if ((await fsp.stat(path.join(directory, "deno.jsonc"))).isFile()) {
      return "deno.jsonc";
    }
  } catch (err) {
    if (err && (err as { code: string }).code !== "ENOENT") {
      throw err;
    }
  }

  return undefined;
}

export function findDenoConfigSync(directory: string): string | undefined {
  try {
    if (fs.statSync(path.join(directory, "deno.json")).isFile()) {
      return "deno.json";
    }
  } catch (err) {
    if (err && (err as { code: string }).code !== "ENOENT") {
      throw err;
    }
  }

  try {
    if (fs.statSync(path.join(directory, "deno.jsonc")).isFile()) {
      return "deno.jsonc";
    }
  } catch (err) {
    if (err && (err as { code: string }).code !== "ENOENT") {
      throw err;
    }
  }

  return undefined;
}
