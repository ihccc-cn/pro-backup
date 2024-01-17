import fs from "fs";
import path from "path";
import yaml from "yaml";

// 遍历目录文件
export function travel(pathname, callback) {
  const files = fs.readdirSync(pathname);
  const fileInfos = [];
  for (let i = 0; i < files.length; i++) {
    const filepath = path.join(pathname, files[i]);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      const filename = path.basename(filepath);
      fileInfos.push({
        name: filename,
        ext: "",
        filename,
        isDirectory,
        pathname: filepath,
        dirname: pathname,
      });
    } else {
      const filename = path.parse(filepath);
      fileInfos.push({
        name: filename.name,
        ext: filename.ext,
        filename: filename.base,
        isDirectory,
        pathname: filepath,
        dirname: pathname,
      });
    }
  }
  callback(fileInfos)?.forEach((item) => {
    if (item && item.isDirectory) travel(item.pathname, callback);
  });
}

// 解析 yaml 内容
export function readBackupYaml(pathname) {
  const file = fs.readFileSync(pathname, "utf8");
  return yaml.parse(file);
}

// 解析 yaml 到 mapping
export function parseYaml(data) {
  const mapping = [];
  for (const filename in data) {
    for (const targetEnv in data[filename]) {
      mapping.push({
        name: filename,
        source: targetEnv,
        sourceName: filename + "." + targetEnv,
        target: data[filename][targetEnv],
        targetName: filename + "." + data[filename][targetEnv],
      });
    }
  }
  return mapping;
}

// 是否是目标环境的文件
export function getIsTargetEnvFile(env) {
  const envReg = new RegExp("(\\.|^)" + env + "(\\.|$)");

  return function (file) {
    return envReg.test(file.name);
  };
}

// 是否是环境文件
export function isEnvFile(file) {
  const nameLength = file.name.split(".").filter((s) => !!s).length;
  return nameLength > 1;
}

// 是否是映射配置文件
export function isMappingFile(file) {
  return file.name === ".backup";
}

// 删除文件名称中的环境名称
export function parseEnvFile(file) {
  const [name, ...envs] = file.name.split(".").filter((s) => !!s);
  return {
    name,
    env: envs.join("."),
  };
}
