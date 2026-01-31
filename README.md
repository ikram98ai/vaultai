# VaultAI

VaultAI is a secure, personal AI workstation built with **Tauri v2**, **Rust**, and **React**. It is the ultimate self-contained AI device: enjoy uncensored, unlimited use with no token limits, zero AI watermarks, and 100% personalized responses, tell it anything, any way you want, and create whatever you need, privately. Everything runs locally, powered by state-of-the-art AI models, so your ideas and data never leave your pocket-sized, portable device, no clouds, no exposure, and no restrictions. With VaultAI, work and create freely and securely, off-grid, wherever you are, with full confidence that only you control what’s inside.


## 🚀 Tech Stack

### Frontend

- **Framework:** React 19 (TypeScript)
- **State Management:** Zustand (Store-based architecture)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Build Tool:** Vite

### Backend

- **Core:** Rust (Tauri v2)
- **Database:** SQLite (via Tauri SQL Plugin)
- **File System:** Local-first encrypted storage (via Tauri FS Plugin)
- **Communication:** Secure IPC Bridge (Type-safe Commands)

---

## 🛠️ Architecture Overview

VaultAI follows a strict **Component -> Store -> Command** flow:

1.  **UI Components**: React views that consume data strictly from Zustand stores.
2.  **Stores**: Orchestrate logic and trigger Tauri commands.
3.  **Commands**: TypeScript wrappers for Rust functions that interact with the OS, Database, and AI.

---

## 🏃 How to Run

### 1. Prerequisites

Before starting, ensure you have the following installed:

- **Node.js & pnpm** (v18 or higher)
- **Rust & Cargo** (Latest stable version)
- **System Dependencies**:
  - **Linux**: `apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) and C++ Build Tools.

### 2. Setup

Clone the repository and install dependencies:

```
 git clone <your-repo-url>
 cd vaultai
 pnpm install
```

### 3. Download AI Models
**MacOS/Linux**: `curl -LsSf https://hf.co/cli/install.sh | bash`

**Window**: `powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"`

- `hf auth login`

- `hf download meta-llama/Llama-3.2-3B  --exclude "original/" --local-dir ./models/llama-3.2-3B`


### 4. Run in Development Mode

This starts the Vite dev server and the Tauri Rust window:

```
 pnpm tauri dev
```

---

## 📦 Building Executables

Tauri handles cross-compilation best when run on the native host OS. To create an executable for your current platform:

### Build Command

```
pnpm tauri build
```
### Output Formats by Platform

_Note: You must build on the respective platform to generate these._

#### 🐧 Linux

- **Format**: `.deb` (Debian/Ubuntu), `.AppImage`
- **Location**: `src-tauri/target/release/bundle/`

#### 🍎 macOS

- **Format**: `.app`, `.dmg`
- **Location**: `src-tauri/target/release/bundle/macos/`

#### 🪟 Windows

- **Format**: `.msi` (installer), `.exe`
- **Location**: `src-tauri/target/release/bundle/msi/`

---

## 📂 Project Structure

- `src/` - React Frontend
  - `assets/` - Static assets (images, icons, fonts)
  - `components/` - View layer & reusable UI
  - `data/` - Static data files (prompts)
  - `services/` - Tauri command definitions & IPC bridges
  - `stores/` - Zustand state management (The Orchestrator)
  - `types/` - TypeScript interfaces and types
  - `App.css` - Global styles
  - `App.tsx` - Root React component
  - `main.tsx` - React entry point

- `src-tauri/` - Rust Backend
  - `src/` - Tauri commands, SQL migrations, and File System logic
  - `capabilities/` - Security permissions for Tauri v2
  - `build.rs` - Build script for Tauri
  - `Cargo.toml` - Rust dependencies and project metadata
  - `tauri.conf.json` - Tauri configuration file

- `.gitignore` - Git ignore rules
- `index.html` - HTML template for Vite
- `package.json` - Node.js dependencies and scripts
- `pnpm-lock.yaml` - PNPM lockfile for dependency versions
- `README.md` - Project documentation
- `splashscreen.html` - Splash screen
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript config for Node environment
- `vite.config.ts` - Vite configuration

---

## 🔮 Future Roadmap

- **Local LLM Inference**: Integration with `llama.cpp` / `mistral.rs`.
- **RAG (Retrieval Augmented Generation)**: Local vector database for document querying with `qdrant`.
- **Image Generation**: Local image generation (FLUX) support.
