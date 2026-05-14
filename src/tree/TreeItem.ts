import * as vscode from 'vscode';
import { FileNode } from '../types';

export class CopyMateTreeItem extends vscode.TreeItem {
    constructor(public readonly node: FileNode) {
        super(
            node.label,
            node.isDirectory
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None
        );

        this.resourceUri = node.uri;
        this.checkboxState = node.checked
            ? vscode.TreeItemCheckboxState.Checked
            : vscode.TreeItemCheckboxState.Unchecked;
        this.iconPath = node.isDirectory ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
        this.tooltip = node.uri.fsPath;
        this.contextValue = node.isDirectory ? 'copymateFolder' : 'copymateFile';
    }
}
