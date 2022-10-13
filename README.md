# pro-backup

备份与还原项目文件的工具

### 使用方法

1. 安装

```bash
npm install pro-backup -save--dev
```

2. 使用

```bash
# 创建一个新备份项目，保存路径在 .pro-backup/pathname
pro-backup pathname 项目名称

# 添加新备份文件 file.js
pro-backup /src/page/path/file.js

# 还原或备份
pro-backup
```
