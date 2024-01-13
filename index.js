#!/usr/bin/env node

// import path from "path";
import { getInputEnv } from "./src/prompt.js";
import { getCache, setCache } from "./src/cache.js";

// 默认分割符
// const SPLITER = ".";

function scanEnvFiles() {}

// 切环境
async function switchTo(envName) {
  let { env } = getCache();
  if (!env) {
    env = await getInputEnv();
    if (env === envName) {
      console.log("❌ 不能和当前环境名称一致！");
      switchTo(envName);
      return;
    }
  }
  // 扫描到的环境文件暂时存储起来 { main: '', files: [],  };
  const envFiles = [];

  scanEnvFiles();
  console.log(envName, env, process.cwd());
}

function main() {
  const args = process.argv.splice(2);

  console.log(args);

  if (args.length === 0) {
    // 执行命令
    // - 重命名环境：将一个环境的文件和映射内容都重命名为新的名称
    // - 删除环境：删除一个环境的文件和映射内容
    // - 拷贝环境：将一个环境拷贝到新的环境
    // - 提取源码：将一个环境的源代码文件提取到压缩包
  } else if (args.length === 1) {
    // 切换分支，只是修改文件名
    // pro-backup new
    // index.new 和 index 两个文件
    // new -> index，index -> index.env => index.old
    switchTo(args[0]);
  } else if (args.length > 1) {
    // 拷贝一个文件到备份的环境中
    // pro-backup copy E:\d\pro-backup\src\prompt.js old
    // 拷贝文件prompt.js -> prompt.old.js
  }
}

main();
