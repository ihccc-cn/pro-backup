import inquirer from "inquirer";

// 输入迁出环境名称
export function getInputEnv() {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "env",
        message: "📦 请输入迁出的环境名称?",
      },
    ])
    .then((res) => res.env);
}
