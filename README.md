# 近原 · 接近无损的视频压缩

把上传的视频压得更小，同时尽量不改观感。默认用 **CRF 恒定质量**（H.264 CRF 18 左右，也就是常见的“视觉无损”区间），保持原分辨率和帧率，只去掉人眼不容易察觉的冗余。

有本机 / 服务器上的 FFmpeg 时走服务端编码（更快，支持 H.265 和 AV1）。没有 FFmpeg 时自动改在浏览器里用 ffmpeg.wasm 压缩，视频不会上传。

## 本地运行

需要 Node.js 20+。服务端压缩还需要系统里的 `ffmpeg` 和 `ffprobe`（macOS 可用 `brew install ffmpeg`）。

```bash
npm install
npm run dev
```

打开终端里提示的地址。默认开发端口是 `43173`。

站点内有 `/principles` 技术原理与 `/faq` 常见问题。

```bash
npm run build
npm start
```

## 怎么用

1. 拖入或选择一条视频（MP4 / MOV / WebM / MKV 等）。
2. 选画质：近无损、高画质、均衡、轻量。
3. 需要更小体积时改用 H.265 或 AV1，或限制到 1080p / 720p。
4. 压缩完成后用滑杆对比，再下载。

## 部署说明

这是 Next.js 应用，可以部署到 Vercel。Vercel 默认环境没有 FFmpeg，网站会自动改用浏览器本地压缩。要获得更快、支持更多编码的体验，请部署到能安装 FFmpeg 的主机。

当前生产地址：[https://jinyuan.vercel.app](https://jinyuan.vercel.app)。源码在 [github.com/timsunzz/nearlossless](https://github.com/timsunzz/nearlossless)，之后推到 `main` 会自动重新部署。
