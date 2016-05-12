#!/bin/bash
#
# open/close tcp-direction(80->8080) for mitmproxy
#
# usage: net-interface(eth0,wlan0...) {on/off}

if [ "$#" -lt 2 ] || [ "$2" != "on" ] && [ "$2" != "off" ]; then
    echo "usage: [net-interface(eth0,wlan0...)] [on/off]"
    exit 0
fi

if [ "$2" == "on" ]; then
    sudo iptables -t nat -A PREROUTING -i $1 -p tcp --dport 80 -j REDIRECT --to-port 8080
else
    sudo iptables -t nat -D PREROUTING -i $1 -p tcp --dport 80 -j REDIRECT --to-port 8080
fi

sudo iptables -t nat -L -n
