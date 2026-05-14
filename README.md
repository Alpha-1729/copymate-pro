# CopyMate Pro

>**Stop manually copying files into ChatGPT.** Browse your workspace, filter with `.copyignore`, and send structured code context to any LLM — right from VS Code.

[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.120.0-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)

---

## What It Does

CopyMate Pro adds a dedicated sidebar panel to VS Code where you can:

- **Browse** your entire workspace file tree with checkbox selection
- **Filter** files and folders using a `.copyignore` file (same glob syntax as `.gitignore`)
- **Copy** selected file contents to clipboard in a structured, LLM-friendly format
- **Copy** your folder tree as a clean ASCII diagram

No more switching between your editor and browser to manually paste code. Select, copy, paste into Claude, ChatGPT, or GitHub Copilot — done.

---

## Installation

### From the VS Code Marketplace

Search for **CopyMate Pro** in the Extensions panel (`Ctrl+Shift+X`) and click Install.

### From a `.vsix` File

```bash
code --install-extension copymate-pro-0.1.0.vsix
```

Or via the Extensions panel: `···` menu → **Install from VSIX…**

---

## Getting Started

1. Open a workspace folder in VS Code
2. Click the **CopyMate Pro** icon in the Activity Bar (left sidebar)
3. Use checkboxes to select files
4. Click **Copy Selected** (📋) to copy file contents to clipboard
5. Paste directly into your LLM chat

---

## Features

### 📁 File Tree with Checkboxes

A dedicated sidebar panel shows your full workspace tree. Click any checkbox to select individual files or entire folders. Selecting a folder automatically selects all files inside it.

### 🚫 `.copyignore` Support

Create a `.copyignore` file at your workspace root to exclude files and folders from the tree. Uses the same glob syntax as `.gitignore`.

```gitignore
# Example .copyignore
node_modules/
dist/
out/
*.env
.env.local
package-lock.json
*.vsix
```

The tree auto-refreshes whenever you save `.copyignore`.

### 📋 Copy Selected File Contents

Copies all checked files to clipboard in a structured format that LLMs parse well:

```
// ── src/extension.ts ──
import * as vscode from 'vscode';
// ... file content ...

// ── src/types.ts ──
export interface FileNode {
// ... file content ...
```

### 🌲 Copy Folder Tree

Copies your workspace structure as a tree diagram — useful for giving an LLM context about your project layout:

```
my-project/
├── src/
│   ├── commands/
│   │   └── index.ts
│   ├── core/
│   │   ├── ClipboardWriter.ts
│   │   └── IgnoreFilter.ts
│   └── extension.ts
├── package.json
└── README.md
```

### ⚡ Toolbar Actions

| Icon | Command | Description |
|------|---------|-------------|
| ✅ | Select All | Check all visible files in the tree |
| ✖ | Unselect All | Uncheck all files |
| 📋 | Copy Selected | Copy checked file contents to clipboard |
| 🌲 | Copy Tree | Copy folder tree structure to clipboard |
| 🚫 | Add to .copyignore | Add checked items to `.copyignore` |
| 🔄 | Refresh | Reload the file tree |

### 🖱️ Right-Click Context Menu

Right-click any file or folder in the CopyMate panel to quickly add it to `.copyignore` without opening the file manually.

---

## Using `.copyignore`

Create a `.copyignore` file in the **root of your workspace** (same directory as `package.json`):

```gitignore
# Dependencies and build output
node_modules/
dist/
out/
.next/
build/

# Environment and secrets
*.env
.env.local
.env.production

# Lock files (usually too noisy for LLM context)
package-lock.json
yarn.lock
pnpm-lock.yaml

# Binary and generated files
*.vsix
*.png
*.jpg
*.svg

# IDE files
.vscode/
.idea/
```

**Glob syntax supported:**

- `node_modules/` — ignore a folder by name anywhere in the tree
- `*.env` — ignore files matching a pattern
- `src/generated/` — ignore a specific path

---

## Requirements

- **VS Code** `^1.120.0`
- A workspace folder must be open

---

## Known Issues

- **Binary files** (images, fonts, compiled outputs) produce unreadable content when copied. Add them to `.copyignore` to exclude them from the tree.
- The extension requires **at least one workspace folder** to be open. It does not work with single-file windows.

---

## Release Notes

### 0.1.0 — Initial Release

- File tree with checkbox selection
- `.copyignore` filtering with glob support
- Copy selected file contents to clipboard in structured format
- Copy folder tree as ASCII diagram
- Select All / Unselect All
- Add to `.copyignore` via right-click or toolbar button
- Auto-reload on `.copyignore` save
- Progress notification while reading large file sets

---

## Contributing

Pull requests and issues are welcome at [github.com/Alpha-1729/copymate-pro](https://github.com/Alpha-1729/copymate-pro).

---

## Author

**Alpha-1729** · [github.com/Alpha-1729](https://github.com/Alpha-1729)

## License

MIT © Alpha-1729
