import fs from "fs";
import path from "path";
import { getInputEnv } from "./prompt.js";
import { getCache, setCache } from "./cache.js";
import {
  travel,
  readBackupYaml,
  parseYaml,
  isMappingFile,
  isEnvFile,
  parseEnvFile,
} from "./utils.js";

function scanEnvFiles() {
  const scanPath = path.join(process.cwd());
  // console.log("scanPath::", scanPath);
  const files = [];

  const keyOf = (item) => path.join(item.dirname, item.name);

  let count = 0;
  travel(scanPath, (list) => {
    const envFiles = {};
    const mainFile = [];
    const nextList = list.map((file) => {
      // console.log(count++);
      // console.log(file);
      if (file.filename === "node_modules") return false;

      if (isMappingFile(file)) {
        // 读取配置内容
        const data = readBackupYaml(file.pathname);
        const mapping = parseYaml(data);
        mapping.forEach((item) => {
          const envInfos = { mapping: true, ...file, ...item };
          const key = keyOf(envInfos);
          if (!envFiles[key]) envFiles[key] = [];
          envFiles[key].push(envInfos);
        });
      } else if (isEnvFile(file)) {
        const fileInfo = parseEnvFile(file);
        const envInfos = { mapping: false, ...file, ...fileInfo };
        const key = keyOf(envInfos);
        if (!envFiles[key]) envFiles[key] = [];
        envFiles[key].push(envInfos);
      } else {
        mainFile.push(file);
      }
      return file;
    });

    mainFile.forEach((file) => {
      const key = keyOf(file);
      if (key in envFiles) {
        files.push({ ...file, envFiles: envFiles[key] });
      }
    });

    return nextList;
  });

  return files;
}

function collectSwitchFiles(fileList, targetEnv, env) {
  const switchEnvList = [];

  fileList.forEach((file) => {
    const targetEnvFile = file.envFiles.find(
      (item) => item.source === targetEnv || item.env === targetEnv
    );
    const backupEnvFile = file.envFiles.find((item) => item.source === env);
    if (!targetEnvFile || targetEnvFile.target === env) return;
    const res = { main: file.pathname };
    if (file.isDirectory) {
      res.target = path.join(
        file.dirname,
        targetEnvFile[targetEnvFile.mapping ? "targetName" : "filename"]
      );
      res.backup = path.join(
        file.dirname,
        backupEnvFile?.targetName || file.name + "." + env
      );
    } else {
      res.target = path.join(
        file.dirname,
        targetEnvFile[targetEnvFile.mapping ? "targetName" : "filename"] +
          (targetEnvFile.mapping ? file.ext : "")
      );
      res.backup = path.join(
        file.dirname,
        (backupEnvFile?.targetName || file.name + "." + env) + file.ext
      );
    }
    if (res.target === res.backup) return;
    switchEnvList.push(res);
  });

  return switchEnvList;
}

// 切环境
export async function switchEnv(targetEnv) {
  let { env } = getCache();
  if (!env) {
    env = await getInputEnv();
    if (env === targetEnv) {
      console.log("❌ 输入不能和当前环境名称一致！");
      switchEnv(targetEnv);
      return;
    }
  }

  if (env === targetEnv) {
    console.log("🔊 Current environment:", env);
    return;
  }
  const startTime = Date.now();

  console.log("🚧 Switch environment:", env, " >>>> ", targetEnv);

  // 扫描到的环境文件暂时存储起来 { main: '', targetFile: '',  };
  const scanFiles = scanEnvFiles();

  // console.log("scanFiles::", JSON.stringify(scanFiles, null, 2));

  const switchEnvList = collectSwitchFiles(scanFiles, targetEnv, env);

  console.log("switchEnvList::", switchEnvList);

  // 扫描子环境的文件，依次提醒过滤
  // 将本次任务进行缓存到本地，如果命令被打断就可以重启

  // 执行对文件依次执行重命名操作
  switchEnvList.forEach((file) => {
    fs.renameSync(file.main, file.backup);
    fs.renameSync(file.target, file.main);
  });

  if (switchEnvList.length === 0) {
    console.log("💫 No change in environment:", targetEnv);
  } else {
    // 切换成功，将当前环境名称记录下来
    setCache({ env: targetEnv });
    console.log("🔊 Current environment:", targetEnv);
  }

  return { startTime };
}
