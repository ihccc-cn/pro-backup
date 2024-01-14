import path from "path";
import { getInputEnv } from "./prompt.js";
import { getCache } from "./cache.js";
import {
  travel,
  genEnvFile,
  readBackupYaml,
  parseYaml,
  collectEnvFiles,
  delEnv,
} from "./utils.js";

function isMappingFile(filename) {
  return filename === ".backup.yaml";
}

function scanEnvFiles(targetEnv) {
  const scanPath = path.join(process.cwd());
  console.log("scanPath::", scanPath);
  const files = [];

  let isEnvFile = genEnvFile(targetEnv);

  // 对每个文件进行遍历
  // 如果文件名包含当前环境名称，说明此文件是需要处理的
  // 如果文件名是 .backup.yaml，说明此文件是配置文件，需要读取配置内容
  // 根据配置内容，获取包含当前环境名称的配置
  let count = 0;
  travel(scanPath, (file) => {
    console.log(file);
    if (file.name === "node_modules") return false;
    // console.log("file::", file);
    if (isMappingFile(file.name)) {
      // 读取配置内容
      const data = readBackupYaml(file.pathname);
      const res = parseYaml(data, targetEnv);
      // 重新扫描当前路径，匹配文件名是 解析结果的文件
      files.push(...collectEnvFiles(file.dirname, res));
    } else if (isEnvFile(file.name)) {
      files.push({
        main: delEnv(file.pathname, targetEnv),
        target: file.pathname,
      });
    }
  });

  isEnvFile = null;
  return files;
}

// 切环境
export async function switchEnv(targetEnv) {
  let { env } = getCache();
  if (!env) {
    env = await getInputEnv();
    if (env === targetEnv) {
      console.log("❌ 不能和当前环境名称一致！");
      switchEnv(targetEnv);
      return;
    }
  }
  console.log(targetEnv, env);
  const startTime = Date.now();

  // 扫描到的环境文件暂时存储起来 { main: '', targetFile: '',  };
  const envFiles = scanEnvFiles(targetEnv);

  const fullInfos = envFiles.map((item) => ({ ...item, backup: "" }));

  console.log("fullInfos::", fullInfos);
  console.log(`${Date.now() - startTime}ms`);

  // 扫描子环境的文件，依次提醒过滤
  // 将本次任务进行缓存到本地，如果命令被打断就可以重启
  // 执行对文件依次执行重命名操作
}
