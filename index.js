#!/usr/bin/env node

const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const inquirer = require("inquirer");

async function readConfig() {
  const prorc = path.join(process.cwd(), `./_pro_backup/index.json`);
  const data = await fsPromises.readFile(prorc);
  return JSON.parse(data.toString("utf-8"));
}

async function main() {
  const prorc = await readConfig();
  const funcs = [
    "↪ 还原（备份文件 -> 项目文件）",
    "↩ 备份（项目文件 -> 备份文件）",
  ];

  function backup(project, isBackup) {
    for (const item of prorc) {
      if (project === item.name) {
        for (const cmap of item.backup) {
          let from = isBackup ? cmap.to : cmap.from;
          let to = isBackup ? cmap.from : cmap.to;
          const toPath = path.join(process.cwd(), to);
          // 如果存在覆盖文件，删除覆盖文件
          console.log("🔪 删除文件：[" + toPath + "]");
          if (fs.existsSync(toPath)) {
            fs.unlinkSync(toPath);
          }
          if (!!from) {
            const fromPath = path.join(process.cwd(), from);
            // 如果存在拷贝文件，拷贝文件到刚才删除文件的位置
            console.log("📝 拷贝文件：[" + fromPath + "]");
            if (fs.existsSync(fromPath)) {
              fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath));
            }
          }
        }
      }
    }
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "project",
        message: "📁 哪一个是你需要的项目?",
        choices: prorc,
      },
      {
        type: "list",
        name: "function",
        message: "🚁 请选择你的操作?",
        choices: funcs,
      },
      {
        type: "confirm",
        name: "confirm",
        message: "❓ 确认执行此操作吗?",
        default: true,
      },
    ])
    .then(answers => {
      if (answers.confirm) {
        if (answers.function === funcs[0]) {
          backup(answers.project, false);
        }

        if (answers.function === funcs[1]) {
          backup(answers.project, true);
        }

        return answers.function;
      }
      return false;
    })
    .then(done => {
      if (done) console.log("<-- " + done + " 执行完成！-->");
    })
    .catch(error => {
      console.log(error);
    });
}

main();
