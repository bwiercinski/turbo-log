import * as vscode from 'vscode'
import { Tail, TailOptions } from '../modules/Tail'
import { SerializationHelper } from '../utils/SerializationHelper'

export const startSessionCommand = (settingEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
    try {
        var tailOptionsAsString = settingEditor.document.getText();
        var tailOptions = SerializationHelper.toInstance(new TailOptions(), tailOptionsAsString);
        startSession(tailOptions);
    } catch (e) {
        vscode.window.showErrorMessage(e.message);
        console.error(e);
    }
}

function startSession(tailOptions: TailOptions): void {
    vscode.languages.getLanguages().then((languages: string[]) => {
        let options = null;
        if (languages.indexOf("log") != -1) { //contains 'log'?
            options = {
                language: "log"
            }
        }
        vscode.workspace.openTextDocument(options).then((textDocument: vscode.TextDocument) => {
            vscode.window.showTextDocument(textDocument, 1, true).then(textEditor => {
                startTailer(tailOptions, textEditor);
            });
        }, (e: any) => {
            vscode.window.showErrorMessage(e.message);
            console.error(e);
        });
    })
}

function startTailer(tailOptions: TailOptions, textEditor: vscode.TextEditor) {
    var tail = new Tail(tailOptions, (data: string): Thenable<void> => appendLine(textEditor, data));

    vscode.workspace.onDidCloseTextDocument((textDocument: vscode.TextDocument) => {
        if (textDocument === textEditor.document) {
            tail.stop();
        }
    });

    tail.start();
}

function appendLine(textEditor: vscode.TextEditor, line: string): Thenable<void> {
    return textEditor.edit(textEditorEdit => {
        textEditorEdit.insert(new vscode.Position(textEditor.document.lineCount, 0), line);
    }).then((fulfilled) => {
        textEditor.revealRange(new vscode.Range(
            new vscode.Position(textEditor.document.lineCount, 0),
            new vscode.Position(textEditor.document.lineCount, 0))
        );
    });
}