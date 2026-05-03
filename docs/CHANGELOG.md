# CHANGELOG

版本变更索引。详细执行记录见 `docs/logs/` 对应日期文件。

---

## 2026-05-03

`feat` **v1.0.0 初始发布** — 详见 [docs/logs/2026-05-03.md](logs/2026-05-03.md)

* `[feat]` Core: 基于 BFS 的背景去除算法，支持纯色 & 棋盘格背景自动识别
* `[feat]` Core: 内孔修复（封闭背景区域二次 BFS）
* `[feat]` Core: 边缘羽化（透明/不透明边界 alpha 渐变）
* `[feat]` UI: 拖拽 / 点击 / 粘贴上传，实时左右对比预览
* `[feat]` UI: 四档强度调节（Precise / Medium / Loose / Max）
* `[feat]` i18n: EN / 中文 / 日本語 / 한국어，浏览器语言自动检测，localStorage 持久化
* `[chore]` Build: Vite + Terser + javascript-obfuscator，混淆输出 dist/
* `[chore]` Deploy: vercel.json，Vercel 自动构建配置
