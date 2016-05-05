# Cabee-proxy

+ fetch
+ track
+ cache
+ pull

| route                   | response                                             |
|-------------------------|------------------------------------------------------|
| /                       | redirect to /track                                   |
| /fetch:filename         | fetch file from [local-cache | remote-cache | server |
| /track                  | show track                                           |
| /track/edit             | edit track                                           |
| /track/active           | track connection status(true/false) in JSON          |
| /cache                  | show a list of all uploaded media files              |
| /cache/delete/:filename | delete single cache                                  |
| /cache/clear            | delete all cache                                     |
| /proxy                  | show proxies                                         |
| /proxy/clear            | clear proxies-info                                   |
| /pull                   | show all pullable file on servers                    |
| /pull/:filename         | pull a file from server to local cache               |