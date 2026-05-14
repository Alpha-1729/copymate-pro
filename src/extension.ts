import * as vscode from 'vscode';
import { TreeProvider } from './tree/TreeProvider';
import { ClipboardWriter } from './core/ClipboardWriter';
import { CopyMateTreeItem } from './tree/TreeItem';
import { registerCommands } from './commands';

export async function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showWarningMessage('CopyMate Pro: No workspace folder open.');
		return;
	}

	const root = workspaceFolders[0].uri;
	const rootLabel = workspaceFolders[0].name;

	const provider = new TreeProvider(root);
	const writer = new ClipboardWriter();

	const treeView = vscode.window.createTreeView('copymateTree', {
		treeDataProvider: provider,
		showCollapseAll: true,
		canSelectMany: false,
		manageCheckboxStateManually: false,
	});

	treeView.onDidChangeCheckboxState((e) => {
		for (const [item, state] of e.items) {
			provider.setItemChecked(item as CopyMateTreeItem, state === vscode.TreeItemCheckboxState.Checked);
		}
	});

	context.subscriptions.push(treeView);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument(async (doc) => {
			if (doc.uri.fsPath.endsWith('.copyignore')) {
				await provider.refresh();
				vscode.window.showInformationMessage('CopyMate Pro: .copyignore reloaded.');
			}
		})
	);

	registerCommands(context, provider, writer, rootLabel);

	await provider.refresh();
}

export function deactivate() { }
