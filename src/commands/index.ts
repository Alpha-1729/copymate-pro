import * as vscode from 'vscode';
import { TreeProvider } from '../tree/TreeProvider';
import { ClipboardWriter } from '../core/ClipboardWriter';
import { CopyMateTreeItem } from '../tree/TreeItem';

export function registerCommands(
    context: vscode.ExtensionContext,
    provider: TreeProvider,
    writer: ClipboardWriter,
    rootLabel: string,
): void {
    const register = (id: string, fn: (...args: any[]) => any) =>
        context.subscriptions.push(vscode.commands.registerCommand(id, fn));

    register('copymate.refreshTree', async () => {
        await provider.refresh();
    });

    register('copymate.selectAll', () => {
        provider.checkAll();
    });

    register('copymate.unselectAll', () => {
        provider.uncheckAll();
    });

    register('copymate.copySelected', async () => {
        const files = provider.getCheckedFiles();
        if (files.length === 0) {
            vscode.window.showWarningMessage('CopyMate Pro: No files selected. Use the checkboxes to pick files first.');
            return;
        }
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `CopyMate Pro: Reading ${files.length} file(s)…`,
                cancellable: false,
            },
            async () => {
                const count = await writer.writeFileContents(files);
                vscode.window.showInformationMessage(`CopyMate Pro: ✅ Copied ${count} file(s) to clipboard.`);
            }
        );
    });

    register('copymate.copyTree', async () => {
        const rootNodes = provider.getRootNodes();
        if (rootNodes.length === 0) {
            vscode.window.showWarningMessage('CopyMate Pro: Tree is empty.');
            return;
        }
        await writer.writeTreeStructure(rootNodes, rootLabel);
        vscode.window.showInformationMessage('CopyMate Pro: 🌲 Folder tree copied to clipboard.');
    });

    register('copymate.addCheckedToIgnore', async () => {
        await provider.addCheckedNodesToIgnore();
    });

    register('copymate.addToIgnore', async (item: CopyMateTreeItem) => {
        if (!item) {
            vscode.window.showWarningMessage('CopyMate Pro: Right-click a file or folder to add it to .copyignore.');
            return;
        }
        await provider.addItemToIgnore(item);
    });
}
