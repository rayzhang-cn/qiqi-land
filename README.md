# 奇奇乐园

给 3-6 岁孩子的离线学习 PWA。

## 开发

npm install
npm run dev          # 开发服务器（--host，iPad 同 Wi-Fi 可访问）
npm test             # 单元测试
npm run e2e          # 端到端测试
npm run validate:content  # 校验关卡 JSON
npm run build        # 构建

## iPad 安装

部署到 HTTPS 静态托管（如 Cloudflare Pages）后，iPad Safari 打开 → 分享 → 添加到主屏幕。

## 添加新关卡

在 src/content/levels/ 新增 JSON 文件（参照现有关卡格式），运行 npm run validate:content 校验。