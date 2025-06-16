import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let keymapPairs: [string, string][] = [];

function loadKeymap(context: vscode.ExtensionContext) {
	const keymapPath = path.join(context.extensionPath, 'keymap.json');
	const raw = fs.readFileSync(keymapPath, 'utf8');
	const keymap = JSON.parse(raw) as Record<string, string[]>;

	keymapPairs = [];
	for (const [symbol, shortcuts] of Object.entries(keymap)) {
		for (const shortcut of shortcuts) {
			keymapPairs.push([shortcut, symbol]);
		}
	}

	keymapPairs.sort((a, b) => b[0].length - a[0].length);
}

export function activate(context: vscode.ExtensionContext) {
	loadKeymap(context);
	const disposable = vscode.commands.registerCommand('apl-keymap.executeGlyph', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const position = editor.selection.active;
		const lineText = editor.document.lineAt(position.line).text.substring(0, position.character);

		for (const [shortcut, symbol] of keymapPairs) {
			if (lineText.endsWith(shortcut)) {
				const startPosition = new vscode.Position(position.line, position.character - shortcut.length);
				const rangeToReplace = new vscode.Range(startPosition, position);

				editor.edit(editBuilder => {
					editBuilder.replace(rangeToReplace, symbol);
				});
				return;
			}
		}
		vscode.commands.executeCommand('tab');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
