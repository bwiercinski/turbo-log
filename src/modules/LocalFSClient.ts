import * as fs from 'fs'
import { SftpClient } from './SftpClient';

export class LocalFSClient extends SftpClient{
    sftp: any = {
        
        stat(path: string, callback: (err, newStats) => void ){
            return fs.stat(path, callback);
        },

        createReadStream(path: string, range: any){
            return fs.createReadStream(path, range);
        }
    };

    constructor(connectionInfo: any) {
        super(connectionInfo);
    }

    connect(onConnect: () => void): void {
       onConnect();
    }

    disconnect(): void {}

}