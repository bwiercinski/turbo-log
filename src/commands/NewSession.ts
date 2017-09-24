import * as vscode from 'vscode'
import { TailOptions } from "../modules/Tail";

export const defaultOptions: TailOptions =
    {
        connectionInfo: {
            host: "localhost",
            port: 22,
            username: "root",
            password: "pass"
        },
        path: "",
        n: 10,
        follow: true,
        speed: 500
    }

export const newSessionCommand = () => {
    const options = {
        language: "json",
        content: JSON.stringify(defaultOptions, null, 2)
    }
    vscode.workspace.openTextDocument(options).then((textDocument: vscode.TextDocument) => {
        vscode.window.showTextDocument(textDocument, 1, true)
    })
}