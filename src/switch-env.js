import fs from "fs";
import path from "path";
import {
  getInputEnv,
  optionsPrompt,
  renamePrompt,
  copyPrompt,
  removePrompt,
  extractPrompt,
} from "./prompt.js";
import { getCache, setCache } from "./cache.js";
import {
  travel,
  readBackupYaml,
  parseYaml,
  isMappingFile,
  isEnvFile,
  parseEnvFile,
} from "./utils.js";

// 获取环境配置信息
function getEnvConfig() {
  const envConfig = path.join(process.cwd(), ".backup.yaml");
  return readBackupYaml(envConfig);
}

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
        const mapping = parseYaml(data.mapping);
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
  const config = getEnvConfig();
  const cacheData = getCache();

  const envList = config.env || [];
  let currentEnv = cacheData.env; // 缓存内当前环境名称

  if (!currentEnv) {
    currentEnv = await getInputEnv(envList);

    if (!currentEnv || currentEnv === targetEnv) {
      setCache({ env: targetEnv });
      console.log("🔊 Current environment:", targetEnv);
      return;
    }
  }

  if (currentEnv === targetEnv) {
    console.log("🔊 Current environment:", currentEnv);
    return;
  }
  const startTime = Date.now();

  console.log("🚧 Switch environment:", currentEnv, " >>>> ", targetEnv);

  // 扫描到的环境文件暂时存储起来 { main: '', targetFile: '',  };
  const scanFiles = scanEnvFiles();

  // console.log("scanFiles::", JSON.stringify(scanFiles, null, 2));

  const switchEnvList = collectSwitchFiles(scanFiles, targetEnv, currentEnv);

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

const options = ["重命名", "拷贝环境", "删除环境", "提取源码"];
export async function selectOptions() {
  const config = getEnvConfig();
  const envList = config.env || [];

  const checked = await optionsPrompt(options);

  if (checked === options[0]) {
    const res = await renamePrompt(envList);
    console.log("重命名：", res);

    // 遍历环境文件
    // 如果是选定的环境的文件，就执行重命名
    // 修改映射文件配置 .backup.yaml
  }
  if (checked === options[1]) {
    const res = await copyPrompt(envList);
    console.log("拷贝环境：", res);

    // 遍历环境文件
    // 如果是选定的环境文件，执行复制操作，使用新环境命名
    // 使用新环境命名
  }
  if (checked === options[2]) {
    const res = await removePrompt(envList);
    console.log("删除环境：", res);

    // 校验通过
    // 遍历环境文件
    // 删除选定环境文件
    // 删除映射配置
  }
  if (checked === options[3]) {
    const res = await extractPrompt(envList);
    console.log("提取源码：", res);

    // 遍历环境文件
    // 如果是选定环境文件，塞入压缩包
    // 如果是映射配置，将映射文件塞入压缩包
  }
}
