# StardustAudioPlayer

## 中文说明

StardustAudioPlayer 是一个高可定制的本地音频可视化播放器，围绕黑胶视觉、粒子系统、歌词渲染和主题联动构建，适合用于音乐展示画面、歌词视频素材和本地播放可视化场景。

项目部署网站：<https://player.tyukki.com>

### 功能特性

- 支持加载本地音频、封面图、背景图
- 支持解析歌词 `SRT` 与歌手信息 `SRT`
- 支持黑胶唱片、波形条、粒子、背景层等可视化元素
- 支持深色、浅色、炫彩三种主题模式
- 配置面板已拆分为独立【布局】与【歌词】栏目，结构更清晰
- 歌词支持多行顺序、主副行设置、描边、活跃过渡效果（静态/流光/动态下划线）
- 歌词阴影支持开关、方向、强度、距离、模糊、颜色，并对主歌词与副歌词生效
- 动态下划线效果可同步应用阴影参数
- 【歌曲详情】字体排版支持各字段独立阴影配置（曲名/艺术家/专辑/视觉设计/翻唱）
- 支持歌手主题色联动（可覆盖文本、进度条、粒子等组件）
- 配置面板支持拖拽调节侧边导航宽度和右侧内容左偏移
- 配置面板支持弹出为独立窗口，可拖到另一显示器使用；弹出后主界面保持可操作
- 支持预设保存与本地配置持久化

### 技术栈

- React
- TypeScript
- Vite
- Custom Web Audio Hooks

### 适用场景

- 本地音乐播放可视化
- 直播、短视频或剪辑场景中的音乐背景画面生成

---

## English

StardustAudioPlayer is a highly customizable local audio visualizer and player built around vinyl-style presentation, particle effects, lyric rendering, and singer-driven theming. It is suitable for music showcase scenes, lyric-video assets, and local playback visualization.

Project deployment website: <https://player.tyukki.com>

### Features

- Load local audio, cover art, and background images
- Parse lyric `SRT` and singer info `SRT`
- Includes vinyl visuals, wave bars, particles, and layered backgrounds
- Supports dark, light, and colorful theme modes
- Settings panel is split into dedicated **Layout** and **Lyrics** sections
- Lyrics support multi-line ordering, primary/secondary line selection, stroke, and active transitions (static/fluid/underline)
- Lyric shadow controls: toggle, direction, strength, distance, blur, and color (applies to both primary and secondary lyric lines)
- Underline transition also respects the configured shadow parameters
- Track details typography supports per-field shadow settings (title/artist/album/visual artist/cover singer)
- Supports singer color mapping with optional force override across key components
- Resizable settings UI: draggable sidebar width and draggable content left padding
- Config panel can be detached into a standalone popup window (multi-monitor friendly) while keeping the main view interactive
- Save presets and persist settings locally

### Tech Stack

- React
- TypeScript
- Vite
- Custom Web Audio hooks

### Use Cases

- Local music playback visualization
- Generating music-focused background scenes for streaming or editing
