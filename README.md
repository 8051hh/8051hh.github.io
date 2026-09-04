# 哈哈 · 开源雷达

> 一个炫酷科技风的 GitHub 开源项目情报站，展示 [HelloGitHub](https://github.com/521xueweihan/HelloGitHub) 每一期的精选项目，并**按编程语言分类**。

## ✨ 特性

- 🛰 **实时数据**：浏览器直接拉取 HelloGitHub 仓库的 Markdown 原文并解析，永远跟随最新一期
- 🗂 **语言分类**：按编程语言（Python / Go / C++ / JavaScript / TypeScript / Rust …）一键筛选
- 🔍 **即时搜索**：按项目名 / 描述实时过滤
- 📅 **期数穿梭**：下拉切换任意一期，或上一期 / 下一期
- 🖼 **焦点 Spotlight**：每期前 3 个项目大图展示，一眼捕获最吸引人的项目
- 🎨 **科技风视觉**：深空星图背景 + HUD 网格 + 玫瑰金主色 + 等宽字体标注

## 🚀 本地运行

纯静态站点，无构建依赖。

### Windows（最简单）

**双击项目里的 `start.bat`**，会自动启动本地服务器并打开浏览器。

### 手动启动

```bash
# 任选其一
python -m http.server 8000
# 或
npx serve .
```

然后访问 http://localhost:8000

## ☁️ 部署到自己的网站

把整个目录上传到任意静态托管即可：

- **GitHub Pages**：推到仓库 → Settings → Pages → 选择分支（`main`/`master`）
- **Vercel / Netlify**：直接导入该目录，构建命令留空、输出目录留空（或填 `.`）
- **自有服务器 / 对象存储**：上传全部文件，配置域名即可

## 📁 文件结构

```
index.html         页面结构
css/style.css      视觉样式
js/lang.js         语言 → 颜色映射
js/parser.js       HelloGitHub Markdown 解析器
js/app.js          数据拉取 + 渲染 + 交互
```

## 📡 数据说明

- 数据来源：[521xueweihan/HelloGitHub](https://github.com/521xueweihan/HelloGitHub)
- 正文内容遵循 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh) 许可，本项目仅供学习与展示，请勿商用
- Markdown 通过 [jsDelivr](https://www.jsdelivr.com/) 加速拉取，GitHub API 仅用于获取期数列表

## 🎛 自定义

- 改主题色：编辑 `css/style.css` 顶部的 `--accent`、`--accent-2`
- 改站点名：编辑 `index.html` 中 `title`、`.brand-text`、`.hero-zh`
- 改每期焦点数量：编辑 `js/app.js` 中 `renderContent` 里的 `projects.slice(0, 3)`

