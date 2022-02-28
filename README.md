# pro_change

切换项目不同文件的工具

### 使用方法

1. 安装

```bash
npm install pro_change -save--dev
```

2. 使用

在项目根目录下的 `/_pro_change` 目录下创建 `/index.json` 文件

文件配置如下：

```json
[
  {
    "name": "wx-project",
    "change": [
      { "from": "/_pro_change/wx/assets/logo.png", "to": "/src/assets/logo.png" },
    ]
  },
  {
    "name": "aj-project",
    "change": [
      { "from": "/_pro_change/aj/assets/logo.png", "to": "/src/assets/logo.png" },
    ]
  },
]
```

3. 在命令行执行

```bash
pro_change
```

> 配置中可以配置多个项目，同时一个 `change` 可以包含多个文件，替换的文件建议统一名称命名。
> 工具会依次删除 `to` 配置的文件，并拷入 `from` 配置的文件，如果不存在，就不会执行相关操作。

| 字段名称 | 释义         | 举例                             |
| -------- | ------------ | -------------------------------- |
| name     | 项目名称     | xxx-项目名称                     |
| change   | 文件替换数组 | -                                |
| from     | 拷贝文件     | /pro/project-xxx/assets/logo.png |
| to       | 删除文件     | /src/assets/logo.png             |