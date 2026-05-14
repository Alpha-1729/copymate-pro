import * as vscode from 'vscode';
import { FileNode } from '../types';
import { IgnoreFilter } from '../core/IgnoreFilter';
import { FileTreeBuilder } from '../core/FileTreeBuilder';
import { IgnoreFileEditor } from '../core/IgnoreFileEditor';
import { CopyMateTreeItem } from './TreeItem';

export class TreeProvider implements vscode.TreeDataProvider<CopyMateTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CopyMateTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private rootNodes: FileNode[] = [];
    private flatNodes: FileNode[] = [];

    private filter = new IgnoreFilter();
    private builder = new FileTreeBuilder(this.filter);
    private ignoreEditor: IgnoreFileEditor;
    private workspaceRoot: vscode.Uri;

    constructor(workspaceRoot: vscode.Uri) {
        this.workspaceRoot = workspaceRoot;
        this.ignoreEditor = new IgnoreFileEditor(workspaceRoot);
    }

    async refresh(): Promise<void> {
        await this.filter.loadFromWorkspace(this.workspaceRoot);
        this.rootNodes = await this.builder.buildTree(this.workspaceRoot, '');
        this.flatNodes = this.builder.getFlatNodes();
        this._onDidChangeTreeData.fire();
    }

    setItemChecked(item: CopyMateTreeItem, checked: boolean): void {
        item.node.checked = checked;
        if (item.node.isDirectory && item.node.children) {
            this.cascadeCheckState(item.node.children, checked);
        }
        this._onDidChangeTreeData.fire();
    }

    checkAll(): void {
        for (const node of this.flatNodes) { node.checked = true; }
        this._onDidChangeTreeData.fire();
    }

    uncheckAll(): void {
        for (const node of this.flatNodes) { node.checked = false; }
        this._onDidChangeTreeData.fire();
    }

    getCheckedFiles(): FileNode[] {
        return this.flatNodes.filter((n) => !n.isDirectory && n.checked);
    }

    getCheckedNodes(): FileNode[] {
        return this.flatNodes.filter((n) => n.checked);
    }

    getRootNodes(): FileNode[] {
        return [...this.rootNodes];
    }

    async addItemToIgnore(item: CopyMateTreeItem): Promise<void> {
        const rel = vscode.workspace
            .asRelativePath(item.node.uri, false)
            .replace(/\\/g, '/');
        const relPath = item.node.isDirectory ? rel + '/' : rel;

        const result = await this.ignoreEditor.appendPaths([relPath]);
        await this.refresh();

        if (result === 'added') {
            vscode.window.showInformationMessage(`CopyMate Pro: Added "${relPath}" to .copyignore`);
        } else {
            vscode.window.showInformationMessage(`CopyMate Pro: "${relPath}" is already in .copyignore`);
        }
    }

    async addCheckedNodesToIgnore(): Promise<void> {
        const checked = this.getCheckedNodes();
        if (checked.length === 0) {
            vscode.window.showWarningMessage('CopyMate Pro: No items checked.');
            return;
        }

        const collapsedPaths = this.collapseToTopLevelPaths(checked);
        const result = await this.ignoreEditor.appendPaths(collapsedPaths);
        await this.refresh();

        if (result === 'already-exists') {
            vscode.window.showInformationMessage('CopyMate Pro: All selected items are already in .copyignore.');
        } else {
            vscode.window.showInformationMessage(`CopyMate Pro: Added ${collapsedPaths.length} item(s) to .copyignore`);
        }
    }

    private collapseToTopLevelPaths(nodes: FileNode[]): string[] {
        const allPaths = nodes.map((n) =>
            vscode.workspace.asRelativePath(n.uri, false).replace(/\\/g, '/')
        );

        const result: string[] = [];

        for (const node of nodes) {
            const rel = vscode.workspace.asRelativePath(node.uri, false).replace(/\\/g, '/');

            const isChildOfAnother = allPaths.some((other) =>
                other !== rel && rel.startsWith(other + '/')
            );

            if (!isChildOfAnother) {
                result.push(node.isDirectory ? rel + '/' : rel);
            }
        }

        return [...new Set(result)];
    }

    getTreeItem(element: CopyMateTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CopyMateTreeItem): CopyMateTreeItem[] {
        const nodes = element ? element.node.children ?? [] : this.rootNodes;
        return nodes.map((n) => new CopyMateTreeItem(n));
    }

    private cascadeCheckState(nodes: FileNode[], checked: boolean): void {
        for (const node of nodes) {
            node.checked = checked;
            if (node.children) { this.cascadeCheckState(node.children, checked); }
        }
    }
}
