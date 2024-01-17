import fs from "fs";
import path from "path";

// 缓存文件路径
const CACHE_PATH = "/node_modules/.pro-backup/cache.json";

const prorc = path.join(process.cwd(), CACHE_PATH);

let cache = null;

// 获取缓存
export function getCache() {
  if (!cache) {
    try {
      const data = fs.readFileSync(prorc, { encoding: "utf-8" });
      cache = JSON.parse(data);
    } catch (e) {}
  }
  return cache || {};
}

export function setCache(data) {
  try {
    const cachePath = path.parse(prorc);
    if (!fs.existsSync(cachePath.dir)) fs.mkdirSync(cachePath.dir);
    fs.writeFileSync(prorc, JSON.stringify({ ...(cache || {}), ...data }), {
      encoding: "utf-8",
    });
  } catch (e) {}
}
