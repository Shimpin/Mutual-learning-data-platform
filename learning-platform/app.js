document.addEventListener('DOMContentLoaded', () => {
    // 获取 token 中的用户信息
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

    // 上传文件
    document.getElementById('uploadForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // 提示上传成功
            })
            .catch(error => {
                console.error('上传失败:', error);
            });
    });

    // 搜索功能
    document.getElementById('searchKeyword')?.addEventListener('input', () => {
        const keyword = document.getElementById('searchKeyword').value;
        if (keyword.trim()) {
            fetch(`/api/search?keyword=${keyword}`)
                .then(response => response.json())
                .then(results => {
                    const resultDiv = document.getElementById('searchResults');
                    resultDiv.innerHTML = '';
                    results.forEach(result => {
                        resultDiv.innerHTML += `
                            <div>
                                <p>${result.file_name || result.description}</p>
                                <a href="/api/download/${result.file_name}" target="_blank">下载</a>
                            </div>
                        `;
                    });
                })
                .catch(error => console.error('搜索失败', error));
        }
    });

    // 显示评论
    fetch('/api/comments')
        .then(response => response.json())
        .then(comments => {
            const commentList = document.getElementById('commentList');
            commentList.innerHTML = ''; // 清空之前的评论
            comments.forEach(comment => {
                commentList.innerHTML += `<p>${comment.comment}</p>`;
            });
        });

    // 提交评论
    document.getElementById('commentForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const comment = event.target.comment.value;
        const user_id = user ? user.id : null; // 获取用户 ID

        if (user_id) {
            fetch('/api/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment, user_id })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message); // 提示评论成功
                })
                .catch(error => console.error('评论提交失败:', error));
        } else {
            alert('请登录后评论');
        }
    });
});
