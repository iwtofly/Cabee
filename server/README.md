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
| /track                  | show track                                         |
| /track/edit             | edit track                                         |
| /track/active           | track connection status(true/false) in JSON        |
| /media                  | show a list of all uploaded media files            |
| /media/delete/:filename | delete single uploaded file                        |
| /media/clear            | delete all uploaded file                           |
| /media/upload           | upload files to server                             |
| /media/list             | list of all uploaded media files in JSON           |
| /delay                  | show a list of delay rules(ip-address, mask, time) |
| /delay/edit             | edit list of delay rules                           |
| /delay/list             | list of all delay rules in JSON                    |