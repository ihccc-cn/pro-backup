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

  inquirer
    .prompt([
      {
        type: "list",
        name: "project",
        message: "哪一个是你需要的项目?",
        choices: prorc,
      },
      {
        type: "confirm",
        name: "confirm",
        message: "确认执行此操作吗?",
        default: true,
      },
    ])
    .then(answers => {
      if (answers.confirm) {
        for (const item of prorc) {
          if (answers.project === item.name) {
            for (const cmap of item.change) {
              const { from, to } = cmap;
              const toPath = path.join(process.cwd(), to);
              if (fs.existsSync(toPath)) fs.unlinkSync(toPath);
              if (!!from) {
                const fromPath = path.join(process.cwd(), from);
                if (fs.existsSync(fromPath)) {
                  fs.createReadStream(fromPath).pipe(
                    fs.createWriteStream(toPath)
                  );
                }
              }
            }
          }
        }
        return true;
      }
      return false;
    })
    .then(done => {
      if (done) console.log("<-- 执行完毕！-->");
    })
    .catch(error => {
      console.log(error);
    });
}

main();
