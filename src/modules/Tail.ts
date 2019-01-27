import * as vscode from 'vscode';
import { SftpClient } from './SftpClient';
import { FileChangeListener } from './FileChangeListener';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import { LocalFSClient } from './LocalFSClient';
import { StringDecoder } from 'string_decoder'

export class Tail extends EventEmitter {
    sftpClient: SftpClient;
    fileChangeListener: FileChangeListener;
    tailOptions: TailOptions;

    onLine: (string: string) => Thenable<void>;
    
    firstRun = true;

    constructor(tailOptions: TailOptions, onLine: (string: string) => Thenable<void>) {
        super();
        
        if (tailOptions.connectionInfo.host.toLowerCase().startsWith("localhost")){
            this.sftpClient = new LocalFSClient(tailOptions.connectionInfo);
        }else{
            this.sftpClient = new SftpClient(tailOptions.connectionInfo);
        }
        
        this.tailOptions = tailOptions;
        this.onLine = onLine;
    }

    start() {
        this.sftpClient.connect(() => {
            this.fileChangeListener = new FileChangeListener(this.tailOptions.path, this.sftpClient, this.tailOptions.speed);
            this.fileChangeListener.on('error', (e) => {
                vscode.window.showErrorMessage(e.message);
                console.error(e);
            });
            this.fileChangeListener.on('fileChanged', (stats) => {
                if (stats.oldStats.size != stats.newStats.size){
                    this.update({
                        start: stats.oldStats.size,
                        end: stats.newStats.size - 1
                    })
                }
                
            });
            this.update();
            this.fileChangeListener.start();
        });
    }

    update(range: any = {}) {
        var decodedString = "";

        try {
            var decoder = new StringDecoder();
            var readStream = this.sftpClient.sftp.createReadStream(this.tailOptions.path, range);
            readStream.on('data', (chunk: Buffer) => {
                    decodedString += decoder.write(chunk)
            }).on('error', (e) => {
                vscode.window.showErrorMessage(e.message);
                console.error(e);
            }).on('end', () => {
                decodedString += decoder.end();
                this.processChunks(decodedString);
                this.firstRun = false;

                if (!this.tailOptions.follow) {
                    this.stop();
                }
            });
        } catch (e) {
            vscode.window.showErrorMessage(e.message);
            console.error(e);
        }
    }

    stop() {
        this.fileChangeListener.stop();
    }

    private processChunks(decodedString: string): void {
        if (this.firstRun) {
            var lines = decodedString.split('\n');
            decodedString = lines.slice(Math.max(0, lines.length - this.tailOptions.n), lines.length).join('\n');
        }
        this.onLine(decodedString);
    }
}

export class TailOptions {
    connectionInfo: any;
    path: string;
    n: number = 10;
    follow: boolean = true;
    speed: number = 500;
}