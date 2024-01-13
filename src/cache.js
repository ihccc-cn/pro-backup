import fs from "fs";
import path from "path";

// 缓存文件路径
const CACHE_PATH = "/node_modules/.pro-backup/cache.json";

let cache = null;

// 获取缓存
export function getCache() {
  if (!cache) {
    try {
      const prorc = path.join(process.cwd(), CACHE_PATH);
      const data = fs.readFileSync(prorc, { encoding: "utf-8" });
      cache = JSON.parse(data);
    } catch (e) {}
  }
  return cache || {};
}

export function setCache() {}
