import * as vscode from 'vscode'
import { EventEmitter } from 'events'
import { Client } from 'ssh2'
import { SftpClient } from './SftpClient';

export class FileChangeListener extends EventEmitter {
    observedFilePath: string
    sftpClient: SftpClient
    running: boolean
    speed: number

    constructor(observedFilePath: string, sftpClient: SftpClient, speed: number = 500) {
        super()
        this.sftpClient = sftpClient
        this.observedFilePath = observedFilePath
        this.speed = speed
    }

    public start(): void {
        this.running = true;
        var self = this;
        this.fileWatcher();
    }

    public stop(): void {
        this.running = false;
        this.sftpClient.disconnect();
    }

    private fileWatcher(stats:any = null): void {
        // get the details of the files on the remote path
        this.sftpClient.sftp.stat(this.observedFilePath, (err, newStats) => {
            if (err) this.emit('error', err)
            if (newStats) {
                if (stats == null) stats = newStats;
                if (stats.size != newStats.size)
                    this.emit('fileChanged',
                        {
                            filePath: this.observedFilePath,
                            newStats: newStats,
                            oldStats: stats
                        }
                    );
                // methods calls itself again after a `speed` millisecond timeout
                if (this.running) {
                    setTimeout(() => this.fileWatcher(newStats), this.speed)
                }
            }
        })
    }
}