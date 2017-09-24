# turbo-log README

`turbo-log` is usefull tool when you have to read log files from remote (of localhost) server.

Thanks to Emil Åström's **Log File Highlighter** data is very readable. Its recomended to install this language support.

![feature X](https://github.com/FachmannPremium/turbo-log/raw/master/assets/showcase.gif)

## Features

### Avaliable commands (Ctrl + Shift + P)

- **Turbo log: Create new session** simply creates new editor with extention settings. For more info about `connectionInfo` section check [SSH2 documentation](https://github.com/mscdex/ssh2#client-methods). This JSON will be used to...

- **Turbo log: Start session** reads from active editor JSON, and opens new session in new text editor. If `follow` flag is on, then every changes in remote file will be appended to this text editor.

## Known Issues

Expand this list by adding issue.

## Release Notes

[Release Notes](CHANGELOG.md)