import * as vscode from 'vscode';
import { FileNode } from '../types';
import { IgnoreFilter } from './IgnoreFilter';

export class FileTreeBuilder {
    private filter: IgnoreFilter;
    private flatNodes: FileNode[] = [];

    constructor(filter: IgnoreFilter) {
        this.filter = filter;
    }

    async buildTree(dirUri: vscode.Uri, relBase: string): Promise<FileNode[]> {
        this.flatNodes = [];
        return this.scanDirectory(dirUri, relBase);
    }

    getFlatNodes(): FileNode[] {
        return [...this.flatNodes];
    }

    private async scanDirectory(dirUri: vscode.Uri, relBase: string): Promise<FileNode[]> {
        let entries: [string, vscode.FileType][];
        try {
            entries = await vscode.workspace.fs.readDirectory(dirUri);
        } catch {
            return [];
        }

        entries.sort(([aName, aType], [bName, bType]) => {
            if (aType === bType) { return aName.localeCompare(bName); }
            return aType === vscode.FileType.Directory ? -1 : 1;
        });

        const nodes: FileNode[] = [];

        for (const [name, type] of entries) {
            const rel = relBase ? `${relBase}/${name}` : name;
            if (this.filter.shouldIgnore(rel)) { continue; }

            const uri = vscode.Uri.joinPath(dirUri, name);
            const isDirectory = type === vscode.FileType.Directory;

            const node: FileNode = {
                uri,
                label: name,
                isDirectory,
                checked: false,
                relPath: rel,
            };

            if (isDirectory) {
                node.children = await this.scanDirectory(uri, rel);
            }

            this.flatNodes.push(node);
            nodes.push(node);
        }

        return nodes;
    }
}
