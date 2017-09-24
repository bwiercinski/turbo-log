import * as vscode from 'vscode'
import { Client, SFTPWrapper } from 'ssh2'

export class SftpClient {
    connectionInfo: any;

    sftp: SFTPWrapper;
    connection: Client;

    constructor(connectionInfo: any) {
        this.connectionInfo = connectionInfo;
    }

    connect(onConnect: () => void): void {
        this.connection = new Client();

        this.connection.on('ready', () => {
            this.connection.sftp((err, sftp) => {
                if (err) throw err;
                this.sftp = sftp;
                onConnect();
            });
        }).on('error', (e) => {
            vscode.window.showErrorMessage(e.message);
            console.error(e);
        }).connect(this.connectionInfo);

        // close connection when the script stops
        // ####### NEEDS TO BE TESTED WHEN RUNNING AS HEADLESS ######
        process.on('SIGINT', () => {
            this.disconnect();
        });
    }

    disconnect(): void {
        console.log(this.connectionInfo.host + ' connection closed \n');
        this.connection.end();
    }

}