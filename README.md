# StardustAudioPlayer

## 中文说明

StardustAudioPlayer 是一个高可定制的本地音频可视化播放器，围绕黑胶唱片、动态粒子、歌词展示和录制能力构建。它适合制作音乐展示画面、歌词视频素材和本地播放可视化场景。

### 功能特性

- 支持加载本地音频、封面、背景图和自定义粒子素材
- 支持解析普通歌词 `SRT` 与歌手信息 `SRT`
- 支持黑胶唱片、波形条、粒子、背景层等多种视觉元素
- 支持深色、浅色和彩色主题
- 支持歌词样式、排版、位置、描边和动态效果配置
- 支持歌手信息联动主题色
- 支持预设保存与本地配置持久化

### 技术栈

- React
- TypeScript
- Vite
- 自定义 Web Audio Hooks

### 本地运行

```bash
npm install
npm run dev
```

### 构建生产版本

```bash
npm run build
npm run preview
```

### 目录结构

```text
components/            播放器 UI、配置面板和可视化组件
hooks/
  useAudioPlayer.ts    音频播放与分析
utils/
  srtParser.ts         歌词与歌手信息解析
  colorUtils.ts        颜色提取
  themeStyles.ts       主题样式
constants.ts           默认配置与预设
types.ts               核心类型定义
App.tsx                主应用入口
```

### 适用场景

- 本地音乐播放可视化
- 直播、短视频或剪辑中的音乐背景画面生成

---

## English

StardustAudioPlayer is a highly customizable local audio visualizer and player built around vinyl-style presentation, dynamic particles, lyric rendering, and recording support. It is suitable for music showcase scenes, lyric video assets, and local playback visualization.

### Features

- Load local audio, cover art, background images, and custom particle assets
- Parse standard lyric `SRT` and singer info `SRT`
- Includes vinyl visuals, wave bars, particles, and layered backgrounds
- Supports dark, light, and colorful themes
- Customize lyric style, layout, position, stroke, and animated effects
- Supports singer-driven theme color overrides
- Save presets and persist settings locally

### Tech Stack

- React
- TypeScript
- Vite
- Custom Web Audio hooks

### Run Locally

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

### Project Structure

```text
components/            Player UI, config panels, and visual components
hooks/
  useAudioPlayer.ts    Audio playback and analysis
utils/
  srtParser.ts         Lyric and singer info parsing
  colorUtils.ts        Color extraction
  themeStyles.ts       Theme styling
constants.ts           Default state and presets
types.ts               Core types
App.tsx                Main application entry
```

### Use Cases

- Local music playback visualization
- Generating music-focused background scenes for streaming or editing
