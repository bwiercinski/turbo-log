import * as vscode from 'vscode'
import { SftpClient } from './SftpClient'
import { FileChangeListener } from './FileChangeListener'
import { EventEmitter } from 'events'

export class Tail extends EventEmitter {
    sftpClient: SftpClient;
    fileChangeListener: FileChangeListener;
    tailOptions: TailOptions;

    onLine: (string: string) => Thenable<void>;

    firstRun = true;

    constructor(tailOptions: TailOptions, onLine: (string: string) => Thenable<void>) {
        super();
        this.sftpClient = new SftpClient(tailOptions.connectionInfo);
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
                this.update({
                    start: stats.oldStats.size,
                    end: stats.newStats.size - 1
                })
            });
            this.update();
            this.fileChangeListener.start();
        });
    }

    update(range: any = {}) {
        var chunks: Buffer[] = [];
        try{
            var readStream = this.sftpClient.sftp.createReadStream(this.tailOptions.path, range);
            readStream.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            }).on('error', (e) => {
                vscode.window.showErrorMessage(e.message);
                console.error(e);
            }).on('end', () => {
                this.processChunks(chunks);
                this.firstRun = false;
    
                if (!this.tailOptions.follow) {
                    this.stop();
                }
            });
        } catch(e) {
            vscode.window.showErrorMessage(e.message);
            console.error(e);
        }
    }

    stop() {
        this.fileChangeListener.stop();
    }

    private processChunks(chunks: Buffer[]): void {
        var content: Buffer = Buffer.concat(chunks);
        var lines = this.bufferToLines(content);

        if (this.firstRun) {
            lines = lines.slice(lines.length - this.tailOptions.n, lines.length);
        }
        this.sendLines(lines);
    }

    private bufferToLines(buffer: Buffer): string[] {
        const newLineNumber = "\n".charCodeAt(0);
        const lines: string[] = [];

        var lastEnd = 0;
        for (var i = 0; i < buffer.length; i++) {
            if (buffer[i] == newLineNumber) {
                lines.push(buffer.toString(undefined, lastEnd, i + 1));
                lastEnd = i + 1;
            }
        }
        return lines;
    }

    private sendLines(lines: string[]): void {
        var runNext = (index: number): void => {
            var thenable: Thenable<void> = this.onLine(lines[index]);
            if (index + 1 < lines.length) {
                thenable.then(() => runNext(index + 1));
            }
        };
        runNext(0);
    }
}

export class TailOptions {
    connectionInfo: any;
    path: string;
    n: number = 10;
    follow: boolean = true;
    speed: number = 500;
}