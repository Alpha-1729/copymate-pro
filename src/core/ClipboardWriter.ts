import * as vscode from 'vscode';
import { FileNode } from '../types';

export class ClipboardWriter {
    async writeFileContents(files: FileNode[]): Promise<number> {
        if (files.length === 0) { return 0; }
        const text = await this.buildFileContentText(files);
        await vscode.env.clipboard.writeText(text);
        return files.length;
    }

    async writeTreeStructure(rootNodes: FileNode[], rootLabel: string): Promise<void> {
        const text = this.buildTreeText(rootNodes, rootLabel);
        await vscode.env.clipboard.writeText(text);
    }

    private async buildFileContentText(files: FileNode[]): Promise<string> {
        const parts: string[] = [];
        for (const file of files) {
            let content: string;
            try {
                const bytes = await vscode.workspace.fs.readFile(file.uri);
                content = new TextDecoder('utf-8').decode(bytes);
            } catch (err) {
                content = `[Error reading file: ${err}]`;
            }
            parts.push(`// ── ${file.relPath} ──\n${content}`);
        }
        return parts.join('\n\n');
    }

    private buildTreeText(rootNodes: FileNode[], rootLabel: string): string {
        const lines: string[] = [`${rootLabel}/`];
        const filteredNodes = this.filterCheckedNodes(rootNodes);
        this.renderTreeNodes(filteredNodes, '', lines);
        return lines.join('\n');
    }

    private filterCheckedNodes(nodes: FileNode[]): FileNode[] {
        const result: FileNode[] = [];
        for (const node of nodes) {
            if (node.checked) {
                if (node.isDirectory && node.children) {
                    result.push({
                        ...node,
                        children: this.filterCheckedNodes(node.children),
                    });
                } else {
                    result.push(node);
                }
            } else if (node.isDirectory && node.children) {
                const filteredChildren = this.filterCheckedNodes(node.children);
                if (filteredChildren.length > 0) {
                    result.push({
                        ...node,
                        children: filteredChildren,
                    });
                }
            }
        }
        return result;
    }

    private renderTreeNodes(nodes: FileNode[], prefix: string, lines: string[]): void {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const isLast = i === nodes.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = prefix + (isLast ? '    ' : '│   ');

            lines.push(prefix + connector + node.label + (node.isDirectory ? '/' : ''));

            if (node.isDirectory && node.children && node.children.length > 0) {
                this.renderTreeNodes(node.children, childPrefix, lines);
            }
        }
    }
}