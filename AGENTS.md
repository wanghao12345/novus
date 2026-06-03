# AGENTS.md

## Project Overview
本项目是一个基于 Tauri 2.0 构建的跨平台轻量级 SFTP 客户端与服务器管理工具。
- **前端技术栈**: React 18+ / TypeScript / Vite / Tailwind CSS / Radix UI
- **图标库**: @radix-ui/react-icons
- **后端技术栈**: Rust / Tauri 2.0 / ssh2 / tokio
- **包管理器**: pnpm
- **样式方案**: Tailwind CSS + CSS Modules (可选)
- **Node版本**: 24.15.0 （可通过`nvm use`命令切换）
- **Rust框架**: 采用workspace管理依赖，包含前端和后端的Rust代码

## Project Structure
src/
├── components/     # UI 组件（优先使用 Radix UI 原语封装）
├── pages/          # 页面级组件（如 FileExplorer, TerminalView）
├── hooks/          # 自定义 Hooks（处理 Tauri IPC 通信等）
├── services/       # 业务逻辑层（SFTP 操作封装）
└── styles/         # 全局 Tailwind 配置与基础样式
src-tauri/
├── crates/         # workspace 目录
├── src/
│   ├── commands/   # Tauri Command 定义（前后端通信桥梁）
│   ├── ./**/       # 其它模块
│   └── main.rs     # Tauri 应用入口
└── Cargo.toml      # Rust 依赖管理

## Coding Style
**TypeScript & React**
- 使用 `interface` 定义 Props 和 Tauri 通信的数据结构。
- 函数组件统一使用具名导出，避免使用 `React.FC`。
- UI 组件必须基于 Radix UI 的原语（Primitives）进行二次封装，确保无障碍访问（a11y）。
- 样式仅允许使用 Tailwind CSS 工具类，禁止硬编码颜色值（使用语义化变量如 `text-primary`, `bg-muted`）。

**Rust Backend**
- 所有涉及 I/O 和网络请求的操作必须使用 `tokio` 异步处理，严禁阻塞 Tauri 主线程。
- Tauri Command 必须返回 `Result<T, String>` 以便前端统一捕获错误。
- 结构体需派生 `serde::Serialize` 和 `serde::Deserialize` 以支持 IPC 序列化。

## Build Commands
- 启动开发环境: `pnpm tauri dev`
- 生产环境构建: `pnpm tauri build`
- 前端代码检查: `pnpm lint`
- Rust 后端检查: `cargo check --manifest-path src-tauri/Cargo.toml`

## Never 规则 (严格遵守)
- Never 修改 `dist/` 或 `target/` 目录下的任何文件。
- Never 修改 `pnpm-lock.yaml` 或 `Cargo.lock` 文件。
- Never 在前端 React 组件中直接引入 Node.js 模块或文件系统 API（必须通过 Tauri IPC 调用 Rust 后端）。
- Never 在渲染路径（Render Path）中执行耗时操作或同步网络请求。
- Never 使用内联样式 (`style={{}}`)，除非是动态计算的坐标/尺寸。
- Never 在列表渲染中省略 `key` 属性。
- Never 直接覆盖用户本地的 `~/.ssh/config` 文件，只允许读取或在独立配置文件中管理。
- Never 在代码中硬编码敏感信息（如密码、私钥），必须通过环境变量或系统 Keychain 获取。