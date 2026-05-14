import * as vscode from 'vscode';

export class IgnoreFileEditor {
    private workspaceRoot: vscode.Uri;

    constructor(workspaceRoot: vscode.Uri) {
        this.workspaceRoot = workspaceRoot;
    }

    async appendPaths(paths: string[]): Promise<'added' | 'already-exists' | 'empty'> {
        if (paths.length === 0) { return 'empty'; }

        const ignoreUri = vscode.Uri.joinPath(this.workspaceRoot, '.copyignore');
        const existing = await this.readIgnoreFile(ignoreUri);
        const existingLines = new Set(
            existing.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
        );

        const newPaths = paths.filter((p) => !existingLines.has(p));
        if (newPaths.length === 0) { return 'already-exists'; }

        const updated =
            existing.trimEnd() +
            (existing.trimEnd() ? '\n' : '') +
            newPaths.join('\n') +
            '\n';

        await vscode.workspace.fs.writeFile(ignoreUri, new TextEncoder().encode(updated));
        return 'added';
    }

    private async readIgnoreFile(uri: vscode.Uri): Promise<string> {
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            return new TextDecoder('utf-8').decode(bytes);
        } catch {
            return '';
        }
    }
}