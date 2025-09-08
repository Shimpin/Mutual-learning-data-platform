# Mutual-learning-data-platform
学习资料互助平台

## 🚀 快速开始

### 环境要求

- Node.js (版本 14.0 或更高)
- MySQL (版本 5.7 或更高)
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd learning-platform
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置数据库**
   - 创建 MySQL 数据库 `learning_platform`
   - 导入数据库结构文件 `learning_platform-2024_12_26_16_19_10-dump.sql`
   - 修改 `server.js` 中的数据库连接配置：
     ```javascript
     const db = mysql.createConnection({
         host: 'localhost',
         user: 'your_username',      // 修改为你的MySQL用户名
         password: 'your_password',  // 修改为你的MySQL密码
         database: 'learning_platform'
     });
     ```

4. **启动服务器**
   ```bash
   npm start
   # 或者
   node server.js
   ```

5. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 📋 功能说明

### 用户功能
- **注册**：新用户可以通过用户名、密码和邮箱注册账户
- **登录**：已注册用户可以使用用户名和密码登录
- **登出**：用户可以安全退出登录状态

### 文件管理
- **上传资料**：用户可以上传学习资料文件，并添加描述信息
- **下载资料**：用户可以下载其他用户分享的学习资料
- **搜索功能**：支持按文件名或描述内容搜索相关资料

### 互动功能
- **评论系统**：用户可以发表评论，与其他用户交流讨论
- **实时更新**：评论内容实时显示，无需刷新页面

## �� API 接口

### 用户相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录

### 文件相关
- `POST /api/upload` - 文件上传
- `GET /api/download/:fileName` - 文件下载
- `GET /api/search?keyword=xxx` - 搜索文件

### 评论相关
- `GET /api/comments` - 获取所有评论
- `POST /api/comment` - 提交评论

## ��️ 数据库设计

### 主要数据表
- `users` - 用户信息表
- `uploaded_files` - 上传文件信息表
- `comments` - 评论信息表

## 🔒 安全特性

- **密码加密**：使用 bcryptjs 对用户密码进行加密存储
- **JWT 认证**：使用 JSON Web Token 进行用户身份验证
- **文件安全**：上传文件使用时间戳重命名，避免文件名冲突
- **输入验证**：对用户输入进行基本验证和过滤

## �� 界面预览

- 现代化响应式设计
- 简洁直观的用户界面
- 良好的用户体验和交互反馈

## �� 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## �� 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

-2535665310@qq.com

## �� 更新日志

### v1.0.0 (2024-12-26)
- 初始版本发布
- 实现基础用户系统
- 实现文件上传下载功能
- 实现搜索和评论功能
- 完成前端界面设计

---

**注意**：使用前请确保已正确配置数据库连接信息，并确保 MySQL 服务正在运行。
