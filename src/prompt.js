import inquirer from "inquirer";

// 输入迁出环境名称
export async function getInputEnv(envList) {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "env",
        message: "📚 请确认当前的环境是?",
        choices: envList,
      },
    ])
    .then((res) => res.env);
}

export async function optionsPrompt(options) {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "✨ 请选择需要执行的功能?",
        choices: options,
      },
    ])
    .then((res) => res.option);
}

export async function renamePrompt(envList) {
  return inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: "请选择环境?",
      choices: envList,
    },
    {
      type: "input",
      name: "rename",
      message: "请输入新名称?",
    },
  ]);
}

export async function copyPrompt(envList) {
  return inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: "请选择环境?",
      choices: envList,
    },
    {
      type: "input",
      name: "rename",
      message: "请输入新环境名称?",
    },
  ]);
}

export async function removePrompt(envList) {
  return inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: "请选择环境?",
      choices: envList,
    },
    {
      type: "input",
      name: "rename",
      message: "请输入环境名称确认删除?",
    },
  ]);
}

export async function extractPrompt(envList) {
  return inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: "请选择环境?",
      choices: envList,
    },
    {
      type: "confirm",
      name: "confirm",
      message: "是否提取此环境代码?",
    },
  ]);
}
