# PurePNG — Smart Background Remover

> 所见即所得的网页版 AI 图片去背景工具。完全本地运行，无上传，输出透明底 PNG。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🖼️ 多种上传方式 | 拖拽 / 点击 / 粘贴 (Ctrl+V) |
| 🎯 智能背景检测 | 自动识别纯色背景 & 棋盘格背景（AI 工具常见）|
| 🕳️ 内部孔洞修复 | 第二轮 BFS 处理封闭区域（如圆环内部）|
| 🎚️ 强度调节 | Precise → Medium → Loose → Max 四档 |
| 🌏 多语言 | EN / 中文 / 日本語 / 한국어，自动检测浏览器语言 |
| 🔒 代码混淆 | Terser + javascript-obfuscator，F12 无法直读源码 |
| ☁️ 一键部署 | Vercel 自动识别 Vite 项目 |

---

## 快速开始

```bash
# 本地开发
npm install
npm run dev        # http://localhost:5173

# 生产构建（含混淆）
npm run build      # → dist/

# 本地预览构建产物
npm run preview
```

---

## 部署到 Vercel

1. 将仓库推送到 GitHub
2. 在 Vercel 中 Import Repository
3. Vercel 自动检测 Vite，使用 `vercel.json` 中的配置构建：
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 无需任何环境变量

---

## 项目结构

```
PurePNG/
├── index.html            Vite HTML 入口（仅结构，无内联逻辑）
├── src/
│   ├── main.js           应用入口：事件绑定、流程调度
│   ├── bgRemoval.js      核心算法：BFS 去背景 + 内孔修复 + 边缘羽化
│   ├── i18n.js           多语言系统：LOCALES、t()、applyLang()
│   └── style.css         暗色主题 UI
├── vite.config.js        构建配置：Terser + javascript-obfuscator
├── package.json
├── vercel.json           Vercel 部署配置
├── docs/
│   ├── CHANGELOG.md      版本变更索引
│   └── logs/             每日执行日志
└── dist/                 构建产物（gitignore）
```

---

## 算法说明

### 背景检测
- **纯色背景**：采样四角 + 边缘像素，聚类后取最大频率色
- **棋盘格背景**：检测黑白/灰白交替的网格纹理（AI 生图工具导出格式）

### 去除流程（4 步）
1. **边缘 BFS**：从图像四边出发，将颜色距离 < tolerance 的连通背景像素全部标记
2. **应用外部去除**：外部标记像素 alpha → 0
3. **内孔 BFS**：对所有仍为背景色且不透明的像素做连通分量分析，若某连通块与外部透明区域不相邻 → 视为内孔，同样去除
4. **边缘羽化**：在透明/不透明边界做 alpha 渐变，消除锯齿

### 性能
- 图片长边超过 2000px 自动缩放
- 全程 Typed Arrays（`Uint8Array`、`Int32Array`）
- BFS 前用 `requestAnimationFrame + setTimeout` 让 UI 先重绘

---

## 支持格式

PNG · JPG · WebP · GIF（静帧）

---

## 开发说明

- **新增语言**：在 `src/i18n.js` 的 `LOCALES` 对象中添加新的语言键，并在 `index.html` 的 `<select id="lang-sel">` 中追加 `<option>`
- **调整算法**：修改 `src/bgRemoval.js`，导出接口 `removeBg(imageData, W, H, tol)` 保持不变
- **混淆配置**：在 `vite.config.js` 的 `obfuscatorPlugin()` 中调整参数；避免开启 `controlFlowFlattening`（Canvas 密集代码会严重降速）
