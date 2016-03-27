# Cabee-server

## Front

show media files to clients(actually intercepted and redirected by proxies)

| route        | response                                        |
|--------------|-------------------------------------------------|
| /            | a list of all uploaded files' name instantly    |
| /*.(jpg|mp4) | file with a delay according to ip address       |
| /ping        | the delay of client                             |

## back

provide a direct view over the server in following aspects

+ track
+ media
+ delay

| route                   | response                                           |
|-------------------------|----------------------------------------------------|
| /                       | redirect to /track                                 |
| /track                  | show track-ip                                      |
| /track/edit             | edit track-ip and redirect to /track               |
| /media                  | show a list of all uploaded media files            |
| /media/delete/:filename | delete an uploaded files and redirect to /media    |
| /media/clear            | clear all uploaded files and redirect to /media    |
| /media/upload           | upload files to server and redirect to /media      |
| /media/list             | list of all uploaded media files in JSON           |
| /delay                  | show a list of delay rules(ip-address, mask, time) |
| /delay/edit             | edit list of delay rules and redirect to /delay    |
| /delay/list             | list of all delay rules in JSON                    |