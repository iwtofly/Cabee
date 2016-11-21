#!/bin/bash
#
# open/close tcp-redirection(80->8080)

if [ "$#" -lt 2 ] || [ "$2" != "on" ] && [ "$2" != "off" ]
then
    echo "usage: <interface> <on|off>"
    exit 0
fi

if [ "$2" == "on" ]
then
    sudo iptables -t nat -A PREROUTING -i $1 -p tcp --dport 80 -j REDIRECT --to-port 8080
else
    sudo iptables -t nat -D PREROUTING -i $1 -p tcp --dport 80 -j REDIRECT --to-port 8080
fi

sudo iptables -t nat -L -n
