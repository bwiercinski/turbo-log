import * as vscode from 'vscode'
import { SftpClient } from './modules/SftpClient'
import { newSessionCommand } from './commands/NewSession'
import { startSessionCommand } from './commands/StartSession'

export function activate(context: vscode.ExtensionContext) {
    console.log('"Turbo log" is now active!')

    let newSessionVsCommand = vscode.commands.registerCommand('turboLog.newSession', newSessionCommand);
    let startSessionVsCommand = vscode.commands.registerTextEditorCommand('turboLog.startSession', startSessionCommand);

    context.subscriptions.push(newSessionVsCommand);
    context.subscriptions.push(startSessionVsCommand);
}
