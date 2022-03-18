# pro-backup

备份与还原项目文件的工具

### 使用方法

1. 安装

```bash
npm install pro-backup -save--dev
```

2. 使用

在项目根目录下创建 `/_pro_backup` 文件夹，并在文件夹下创建 `/index.json` 文件

文件配置如下：

```json
[
  {
    "name": "pro-1",
    "backup": [
      { "from": "/_pro_backup/pro-1/assets/logo.png", "to": "/src/assets/logo.png" },
    ]
  },
  {
    "name": "pro-2",
    "backup": [
      { "from": "/_pro_backup/pro-2/assets/logo.png", "to": "/src/assets/logo.png" },
    ]
  },
]
```

> 配置中可以配置多个项目，同时一个 `backup` 可以包含多个文件，替换的文件需要统一名称命名。
> 工具会依次删除 `to` 配置的文件，并拷入 `from` 配置的文件，如果不存在，就不会执行相关操作。

| 字段名称 | 释义         | 举例                             |
| -------- | ------------ | -------------------------------- |
| name     | 项目名称     | xxx-项目名称                     |
| backup   | 文件替换数组 | -                                |
| from     | 拷贝文件     | /pro/project-xxx/assets/logo.png |
| to       | 删除文件     | /src/assets/logo.png             |

3. 在命令行执行

```bash
pro-backup
```

4. 根据提示选择需要执行的操作
