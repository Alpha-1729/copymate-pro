import * as vscode from 'vscode';
import { minimatch } from 'minimatch';

export class IgnoreFilter {
    private patterns: string[] = [];

    private async readIgnoreFile(uri: vscode.Uri): Promise<string | null> {
        try {
            const raw = await vscode.workspace.fs.readFile(uri);
            return new TextDecoder('utf-8').decode(raw);
        } catch {
            return null;
        }
    }

    async loadFromWorkspace(workspaceRoot: vscode.Uri): Promise<void> {
        this.patterns = [];
        const ignoreFileUri = vscode.Uri.joinPath(workspaceRoot, '.copyignore');
        const content = await this.readIgnoreFile(ignoreFileUri);
        if (!content) { return; }

        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim().replace(/\/$/, '');
            if (trimmed && !trimmed.startsWith('#')) {
                this.patterns.push(trimmed);
            }
        }
    }

    shouldIgnore(relPath: string): boolean {
        const normalized = relPath.replace(/\\/g, '/');
        const segments = normalized.split('/');

        for (const pattern of this.patterns) {
            if (pattern.includes('/')) {
                if (
                    normalized === pattern ||
                    normalized.startsWith(pattern + '/') ||
                    minimatch(normalized, pattern, { dot: true })
                ) {
                    return true;
                }
                continue;
            }

            for (const segment of segments) {
                if (minimatch(segment, pattern, { dot: true, matchBase: true })) {
                    return true;
                }
            }
        }

        return false;
    }

    getPatterns(): string[] {
        return [...this.patterns];
    }
}