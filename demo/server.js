const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());

// 模拟 AI 生成的 Markdown 内容
const markdownContent = [
    '# 项目报告\n\n',
    '## 执行摘要\n\n',
    '本报告展示 **流式 Markdown 输出** 的实现效果。\n\n',
    '## 关键指标\n\n',
    '| 指标 | 值 | 趋势 |\n',
    '|------|-----|------|\n',
    '| 用户增长 | 15% | ↗️ |\n',
    '| 转化率 | 8.2% | → |\n',
    '| 留存率 | 76% | ↗️ |\n\n',
    '## 图片\n\n',
    '![用户增长趋势图](https://static-prod.ituchong.com/tc-common-fe-static/images/tuchong_pc/8813918b04d5fda89ccb7fe6376162cd.jpeg "用户增长趋势")\n\n',
    '## 代码块\n\n',
    '```javascript\n// 示例代码\nfunction streamData() {\n  console.log("实时数据流");\n}\n```\n\n',
    '## mermaid\n\n',
    '```mermaid\ngraph TD\n    A[Enter Chart Definition] --> B(Preview)\n    B --> C{decide}\n    C --> D[Keep]\n    C --> E[Edit Definition]\n    E --> B\n    D --> F[Save Image and Code]\n    F --> B\n```\n\n',
    '## 分析结论\n\n',
    '> 流式传输技术显著提升用户体验\n',
    '> 响应速度提升 **40%**\n\n',
    '**报告生成完成**'
];

// 流式输出 Markdown 的 SSE 接口
app.get('/stream-md', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let index = 0;

    const sendChunk = () => {
        if (index < markdownContent.length) {
            // SSE 格式: data: <content>\n\n
            res.write(`data: ${JSON.stringify({content: markdownContent[index]})}\n\n`);

            // 模拟处理延迟
            const delay = Math.floor(Math.random() * 300) + 100;
            index++;
            setTimeout(sendChunk, delay);
        } else {
            res.write('event: end\ndata: {}\n\n');
            res.end();
        }
    };

    sendChunk();

    // 客户端断开连接时清理
    req.on('close', () => {
        index = markdownContent.length;
        res.end();
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});