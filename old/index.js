#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const BACKUP_PATH = "/.pro-backup";
const BACKUP_RC_PATH = "/.pro-backup/config.json";

function checkRc(config) {
  if (!config || Array.isArray(config.backup) === false || Array.isArray(config.projects) === false) {
    console.log("❗❗ 配置文件出现了问题！");
    return false;
  }
  return true;
}

function readConfig() {
  const prorc = path.join(process.cwd(), BACKUP_RC_PATH);
  const data = fs.readFileSync(prorc, { encoding: "utf-8" });
  return JSON.parse(data);
}

function startBackup(config, project, isBackup) {
  const currentProject = config.projects.find(item => item.name === project);
  const project_path = path.join(process.cwd(), BACKUP_PATH, currentProject.path);

  function copy(source, target) {
    // 如果存在覆盖文件，删除覆盖文件
    if (fs.existsSync(target)) {
      console.log("🔪 删除文件：[" + target + "]");
      fs.unlinkSync(target);
    }
    // 如果存在拷贝文件，拷贝文件到刚才删除文件的位置
    if (fs.existsSync(source)) {
      console.log("📝 拷贝文件：[" + source + "]");
      fs.createReadStream(source).pipe(fs.createWriteStream(target));
    }
  }

  config.backup.forEach(filePath => {
    const proFilePath = path.join(process.cwd(), filePath);
    const backupFilePath = path.join(project_path, path.basename(filePath));
    if (isBackup) {
      copy(proFilePath, backupFilePath);
    } else {
      copy(backupFilePath, proFilePath);
    }
  });
}

async function backup() {
  const prorc = readConfig();
  if (!checkRc(prorc)) return;
  const funcs = ["↪ 还原（备份文件 -> 项目文件）", "↩ 备份（项目文件 -> 备份文件）"];

  inquirer
    .prompt([
      {
        type: "list",
        name: "project",
        message: "📁 哪一个是你需要操作的项目?",
        choices: prorc.projects.map(item => item.name),
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
    .then(async answers => {
      if (answers.confirm) {
        if (answers.function === funcs[0]) {
          startBackup(prorc, answers.project, false);
        }

        if (answers.function === funcs[1]) {
          startBackup(prorc, answers.project, true);
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

async function push(filePath) {
  inquirer
    .prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "确认备份此文件 <" + filePath + "> 吗？",
        default: true,
      },
    ])
    .then(answers => {
      if (answers.confirm) {
        const prorc = readConfig();
        if (!checkRc(prorc)) return false;
        const _filePath = path.isAbsolute(filePath) ? filePath.replace(process.cwd(), "") : filePath;
        const to = path.join("/", _filePath);

        if (prorc.backup.indexOf(to) > -1) {
          console.log("❌ 失败: 文件已存在！");
        } else {
          prorc.backup.push(to);
        }
        const conf_path = path.join(process.cwd(), BACKUP_RC_PATH);
        fs.writeFileSync(conf_path, JSON.stringify(prorc), { encoding: "utf-8" });
        return "添加备份文件";
      }
    })
    .then(done => {
      if (done) console.log("<-- " + done + " 执行完成！-->");
    })
    .catch(error => {
      console.log(error);
    });
}

/**
 * 初始化备份项目，此操作应该在根目录执行
 * @param {string} folder 文件夹名称
 * @param {string} name 项目名称
 */
async function init(folder, name) {
  // 判断当前路径有没有_pro_backup文件夹，没有则创建一个 _pro_backup 文件夹
  const backup_path = path.join(process.cwd(), BACKUP_PATH);
  if (!fs.existsSync(backup_path)) fs.mkdirSync(backup_path);

  // 判断文件夹下有没有 index.json 文件
  const conf_path = path.join(process.cwd(), BACKUP_RC_PATH);
  let writeConfig = [];
  if (!fs.existsSync(conf_path)) {
    // 如果没有，在 _pro_backup 文件夹下 写入一个 index.json 文件
    // 文件内容是 { backup: [], projects: [{ name: name, path: folder }] }
    writeConfig = { backup: [], projects: [{ name: name, path: folder }] };
  } else {
    // 如果有文件，读取文件内容
    // 在文件夹内容写入一个 项目配置 { name: name, backup: [] }
    // 写入文件
    const currentConfigString = fs.readFileSync(conf_path, { encoding: "utf-8" });
    try {
      const prorc = JSON.parse(currentConfigString);
      if (!checkRc(prorc)) return;
      if (prorc.projects.find(item => item.name === name)) {
        console.log("❌ 失败: 项目 <" + name + "> 已存在");
        return;
      }
      if (prorc.projects.find(item => item.folder === folder)) {
        console.log("❌ 失败: 文件夹 <" + folder + "> 已存在");
        return;
      }
      prorc.projects.push({ name: name, path: folder });
      writeConfig = prorc;
    } catch (e) {
      console.log(e);
      writeConfig = currentConfigString;
    }
  }
  fs.writeFileSync(conf_path, typeof writeConfig === "string" ? writeConfig : JSON.stringify(writeConfig), { encoding: "utf-8" });
  console.log("✨ 新建项目：", name);
  const pro_path = path.join(backup_path, folder);
  if (!fs.existsSync(pro_path)) fs.mkdirSync(pro_path);
  console.log("📁 备份路径：", pro_path);
}

async function main() {
  const args = process.argv.splice(2);

  if (args.length === 0) backup();

  if (args.length === 1) push(...args);

  if (args.length === 2) init(...args);
}

main();
