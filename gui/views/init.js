$(document).ready(() =>
{
  //
  // init Painter
  //
  window.painter = new Painter();

  //
  // all the host given by GUI-backend
  //
  window.hosts = [];
  //
  // try get the host by given info
  //
  window.get_host = function()
  {
    // pass ip-port-pos
    ip = arguments[0];
    port = arguments[1];
    pos = arguments[2];

    // or pass info-object
    if (arguments.length == 1)
    {
      ip = arguments[0].ip;
      port = arguments[0].conf.port;
      pos = arguments[0].conf.pos;
    }

    for (host of window.hosts)
    {
      if ((ip == host.ip && port == host.conf.port) ||
          (pos && (pos == host.conf.pos)))
         return host;
    }

    let user = new User(ip, port);
    window.hosts.push(user);
    
    return user;
  };

  //
  // try to get real-ip-address of a host
  //
  let ip_format = (ip) =>
  {
    if (ip != '127.0.0.1')
      return ip;

    if (location.hostname != 'localhost')
      return location.hostname;

    return '127.0.0.1';
  };

  //
  // connect to gui-backend, get host-list
  //
  let self_io = io('/user');

  self_io.on('connect', (socket) =>
  {
    console.log('connect to GUI-backend');
  });

  self_io.on('disconnect', (socket) =>
  {
    console.log('disconnect to GUI-backend');
  });

  self_io.on('refresh', (hosts) =>
  {
    console.log('hosts recv');
    // window.hosts = [];
    window.logs = {
      group1: [],
      group2: []
    };
    for (info of hosts)
    {
      info.ip = ip_format(info.ip);

      switch (info.conf.type)
      {
        case 'track':
          window.hosts.push(new Track(info));
          break;

        case 'netif':
          window.hosts.push(new NetworkInfo(info));
          break;

        case 'server':
          window.hosts.push(new Server(info));
          break;

        case 'proxy':
          window.hosts.push(new Proxy(info));
          if (info.conf.name.substr(0,3) === 'MEC') {
            window.hosts.push(new Station(info));
          }
          break;
      }
    }
    
    window.painter.tree(window.hosts);
  });

});