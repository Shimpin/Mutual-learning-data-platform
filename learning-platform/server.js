// 引入依赖
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer'); // 引入 multer 用于处理文件上传
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// 创建 Express 应用
const app = express();  // 在这里创建 app 实例
const port = 3000;

// 配置 Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 配置 CORS（跨域）
app.use(cors());  // 允许所有来源的请求

// 配置文件上传（使用 multer）
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 文件存储路径
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // 使用时间戳加文件名，避免文件名重复
    }
});

const upload = multer({ storage: storage });

// 创建数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // 替换为你的 MySQL 用户名
    password: '123456', // 替换为你的 MySQL 密码
    database: 'learning_platform'  // 替换为你的数据库名
});

// 连接数据库
db.connect((err) => {
    if (err) {
        console.error('数据库连接失败：', err.stack);
        return;
    }
    console.log('数据库连接成功');
});

// 异步封装数据库查询
const queryDb = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// 用户注册 API
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // 检查用户名是否已经存在
        const userExist = await queryDb('SELECT * FROM users WHERE username = ?', [username]);
        if (userExist.length > 0) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 将新用户数据插入数据库
        await queryDb('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

        res.status(201).json({ message: '用户注册成功，请登录' });
    } catch (err) {
        console.error('注册失败：', err);
        res.status(500).json({ message: '数据库错误5' });
    }
});

// 用户登录 API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 查询用户
        const user = await queryDb('SELECT * FROM users WHERE username = ?', [username]);
        if (user.length === 0) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 比对密码
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign({ id: user[0].id, username: user[0].username }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ message: '登录成功', token });
    } catch (err) {
        console.error('登录失败：', err);
        res.status(500).json({ message: '数据库错误6' });
    }
});

// 中间件：验证 JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // 从请求头中提取 token

    if (!token) {
        return res.status(403).json({ message: '请先登录' });
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ message: '无效的 token' });
        }

        req.user = user; // 将用户信息存入请求对象
        next();  // 继续处理请求
    });
};

// 文件下载 API
app.get('/api/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName); // 假设文件存储在 uploads 目录中

    // 如果文件存在，返回文件给客户端下载
    res.download(filePath, (err) => {
        if (err) {
            console.error('文件下载失败：', err);
            res.status(500).json({ message: '文件下载失败' });
        }
    });
});

// 文件上传 API
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '未上传文件' });
    }

    // 获取文件信息
    const filePath = req.file.path;  // 文件存储的路径
    const fileName = req.file.filename;
    const description = req.body.description;

    // 将文件信息存储到数据库
    const query = 'INSERT INTO uploaded_files (file_name, file_path, description) VALUES (?, ?, ?)';
    db.query(query, [fileName, filePath, description], (err, result) => {
        if (err) {
            return res.status(500).json({ message: '文件保存失败', error: err });
        }

        res.status(200).json({ message: '文件上传成功', file: req.file });
    });
});

// 搜索学习资料和问题 API
app.get('/api/search', (req, res) => {
    const { keyword } = req.query;  // 获取查询关键词
    const query = `
        SELECT * FROM uploaded_files WHERE file_name LIKE ? OR description LIKE ?
    `;
    db.query(query, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
        if (err) return res.status(500).json({ message: '数据库错误4' });
        res.json(results);  // 返回搜索结果
    });
});

// 获取所有评论 API
app.get('/api/comments', (req, res) => {
    const query = 'SELECT * FROM comments';
    db.query(query, (err, comments) => {
        if (err) return res.status(500).json({ message: '数据库错误3' });
        res.json(comments);  // 返回所有评论
    });
});

// 评论提交 API
app.post('/api/comment', async (req, res) => {
    const { comment, parent_comment_id = null } = req.body;

    try {
        // 确保传入数据有效
        if (!comment) {
            return res.status(400).json({ message: '评论内容缺失' });
        }

        // 获取当前时间，并将其转换为 MySQL 支持的格式
        const created_at = new Date().toISOString().slice(0, 19).replace('T', ' '); // 例如: '2024-12-26 08:07:22'

        // 将评论数据插入数据库
        const query = 'INSERT INTO comments (comment, parent_comment_id, created_at) VALUES (?, ?, ?)';
        await queryDb(query, [comment, parent_comment_id, created_at]);

        res.status(201).json({ message: '评论提交成功' });
    } catch (err) {
        console.error('评论提交失败：', err);
        res.status(500).json({ message: '数据库错误' });
    }
});




// 提供静态文件服务（如 index.html）
app.use(express.static(path.join(__dirname, 'frontend')));

// 处理根路径（/）请求，返回前端首页（index.html）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在监听 http://localhost:${port}`);
});

// 评论提交 API
app.post('/api/comment', async (req, res) => {
    const { comment, id } = req.body;

    try {
        // 确保传入数据有效
        if (!comment || !id) {
            return res.status(400).json({ message: '评论内容或用户ID缺失2' });
        }

        // 将评论数据插入数据库
        const query = 'INSERT INTO comments (id, comment) VALUES (?, ?)';
        await queryDb(query, [id, comment]);

        res.status(201).json({ message: '评论提交成功' });
    } catch (err) {
        console.error('评论提交失败：', err);
        res.status(500).json({ message: '数据库错误2' });
    }
});
// 使用 fetch 从 API 获取评论并展示
fetch('/api/comments')
    .then(response => response.json())
    .then(comments => {
        // 假设你有一个容器来显示评论
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = ''; // 清空现有的评论

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.innerHTML = `
                <p>${comment.comment}</p>
                <small>创建时间: ${comment.created_at}</small>
            `;
            commentsContainer.appendChild(commentElement);
        });
    })
    .catch(error => {
        console.error('获取评论失败:', error);
    });
