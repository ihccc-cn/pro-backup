#!/usr/bin/env node

// import path from "path";
import { switchEnv, selectOptions } from "./src/switch-env.js";

// 默认分割符
// const SPLITER = ".";

async function main() {
  let startTime = null;
  const args = process.argv.splice(2);

  console.log("args::", args);

  if (args.length === 0) {
    // 执行命令
    // - 重命名环境：将一个环境的文件和映射内容都重命名为新的名称
    // - 拷贝环境：将一个环境拷贝到新的环境
    // - 删除环境：删除一个环境的文件和映射内容
    // - 提取源码：将一个环境的源代码文件提取到压缩包
    selectOptions();
  } else if (args.length === 1) {
    const targetEnv = args[0];
    const res = await switchEnv(targetEnv);
    startTime = res?.startTime;
  } else if (args.length === 2 && args[0] === "add") {
    // 添加环境文件
    console.log("添加环境文件");
  } else if (args.length === 2 && args[0] === "del") {
    // 删除环境文件
    console.log("删除环境文件");
  }
  startTime && console.log(`⌛ 本次操作用时：${Date.now() - startTime}ms`);
}

main();
