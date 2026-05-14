import * as vscode from 'vscode';

export interface FileNode {
    uri: vscode.Uri;
    label: string;
    relPath: string;
    isDirectory: boolean;
    children?: FileNode[];
    checked: boolean;
}
