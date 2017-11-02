var dns = Meteor.npmRequire('native-dns');

ProxyServer = function(proxy){
   // EventEmitter.call(this);
    this.proxy = proxy;
    var cacheKey = generateRandomHash();
    if(proxy)
        cacheKey = proxy._id;
    this.dnsCache = {};
};

ProxyServer.prototype.checkAuthRequest = function(request){
    var proxy = this.proxy;
    if(proxy.allowedIps&&proxy.allowedIps.indexOf(request.connection.remoteAddress)>-1)
        return true;
    if(!proxy.login)
        return true;
    if(!isset(request.headers['proxy-authorization']))
        return false;

    try {
        var credits = request.headers['proxy-authorization'];
        if(/^basic\s+/gi.exec(credits)){
            credits = credits.replace(/^basic\s+/gi,'');
            credits = new Buffer(credits, 'base64').toString('utf8');
            credits = credits.split(':');
            if (credits.length == 2) {
                var login = credits[0], pass = credits[1];
                if (proxy.login === login && proxy.pass === pass){
                    delete( request.headers['proxy-authorization'] );
                    return {login:login.login,pass:pass};
                }
            }
        }
    }catch (e){
        console.log(e.trace);
    }

    return false;
};

ProxyServer.prototype.resolveDns = function(hostname) {
    var proxyServer = this;
    var f = Meteor.wrapAsync( function (hostname, callback) {
            if(isset(proxyServer.dnsCache[hostname])){
                if(proxyServer.dnsCache[hostname].date.getTime()>getNowTime()-300*60*1000)
                    return callback(null, proxyServer.dnsCache[hostname].value);
            }
            var cb = _.once(function (err, result) {
                npmFibers(
                    function () {
                        console.log('ip of:', hostname, ':', result);
                        if(result)
                            proxyServer.dnsCache[hostname] = {date:new Date(),value:result};
                        callback(err, result);
                    }
                ).run();
            });

            var question = dns.Question({
                name: hostname,
                type: 'AAAA',
                //type: 'A',
            });
            var req = dns.Request({
                question: question,
                server: {address:_.sample(['2a02:6b8::feed:0ff','2a02:6b8:0:1::feed:0ff','2001:4860:4860::8888','2001:4860:4860::8844'])},
                //server: {address: '8.8.8.8', type: 'udp'},
                timeout: 20000,
            });

            req.on('timeout', function () {
                cb(null, null);
            });

            req.on('message', function (err, answer) {
                var ip = null;
                try {
                    answer.answer.forEach(function (a) {
                        if (a.address)
                            ip = a.address;
                    });
                } catch (e) {
                    console.log(e);
                }
                cb(null, ip);
            });

            req.on('end', function () {
                cb(null, null);
            });

            req.send();

        });

    return f(hostname);
};

ProxyServer.prototype.onRequest = function(request, response){
    var proxy = this.proxy;
    var authCredits = this.checkAuthRequest(request);
    if (!authCredits) {
        response.writeHead(407, {'Proxy-Authenticate': 'Basic realm="proxy"'});
        return response.end();
    }

    console.log(request.headers);
    var outgoingInterface =  this.getOutgoingInterface(authCredits);

    //DynamicInterfaces.beforeConnection(outgoingInterface);
    //console.log('open(H):',request.url,'openCount:',DynamicInterfaces.getSocketsCount(outgoingInterface));

    var ph = url.parse(request.url);
    var options = {
        method: request.method,
        path: request.url,
        headers: request.headers || {},
        localAddress: outgoingInterface,
        family: 6
    };
    if (safeGet(proxy, 'backconnect.ip')) {
        options.hostname = safeGet(proxy, 'backconnect.ip');
        options.port = safeGet(proxy, 'backconnect.port');
        var backconnectLogin = safeGet(proxy, 'backconnect.login');
        if (backconnectLogin) {
            var backconnectPass = safeGet(proxy, 'backconnect.pass');
            options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(backconnectLogin + ':' + backconnectPass).toString('base64');
        }
    } else {
        var host = this.resolveDns(ph.hostname);
        options.port = parseInt(ph.port);
        options.hostname = host;
        options.host = host;
    }

    var gatewayRequest = http.request(options);
    /*gatewayRequest.on('socket',function(socket){
        socket.once('close',function(){
            npmFibers(function(){
                DynamicInterfaces.afterDisconnect(outgoingInterface);
            }).run();
        });
    });*/
    gatewayRequest.on('error', function (err) {
        /*npmFibers(function(){
            DynamicInterfaces.afterDisconnect(outgoingInterface);
        }).run();*/
        console.log('[error] ', err);
        response.end()
    });
    gatewayRequest.on('response', function (gatewayResponse) {
        if (gatewayResponse.statusCode === 407) {
            console.log('[error] AUTH REQUIRED');
            return;
        }
        gatewayResponse.on('data', function (chunk) {
            response.write(chunk, 'binary');
        });
        gatewayResponse.on('end', function () {
            response.end();
        });
        response.writeHead(gatewayResponse.statusCode, gatewayResponse.headers);
    });
    request.on('data', function (chunk) {
        gatewayRequest.write(chunk, 'binary');
    });
    request.on('end', function () {
        gatewayRequest.end()
    });
    gatewayRequest.end();
};

ProxyServer.prototype.onConnect = function(request, socketRequest, head){
    console.log(request.headers);
    var authCredits = this.checkAuthRequest(request);
    var proxy = this.proxy;
    if (!authCredits) {
        socketRequest.write("HTTP/" + request.httpVersion + " 407 auth required\r\n");
        socketRequest.write("Proxy-Authorization:Basic realm=\"proxy\"\r\n\r\n");
        return socketRequest.end();
    }

    var outgoingInterface =  this.getOutgoingInterface(authCredits);

    //DynamicInterfaces.beforeConnection(outgoingInterface);
    //console.log('open(S):',request.url,'openCount:',DynamicInterfaces.getSocketsCount(outgoingInterface));

    var ph = url.parse('http://' + request.url);

    if (safeGet(proxy, 'backconnect.ip')) {
        var options = {
            method: request.method,
            path: request.url,
            headers: request.headers || {},
            localAddress: proxy.outgoingInterface
        };
        options.hostname = safeGet(proxy, 'backconnect.ip');
        options.port = safeGet(proxy, 'backconnect.port');
        var backconnectLogin = safeGet(proxy, 'backconnect.login');
        if (backconnectLogin) {
            var backconnectPass = safeGet(proxy, 'backconnect.pass');
            options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(backconnectLogin + ':' + backconnectPass).toString('base64');
        }

        var gatewayRequest = http.request(options);
        gatewayRequest.on('error', function (err) {
            console.log('[error] ' + err);
        });
        gatewayRequest.on('connect', function (res, socket, head) {
            socket.setTimeout(300 * 1000);
            socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n");
            socket.on('data', function (chunk) {
                socketRequest.write(chunk, 'binary')
            });
            socket.on('end', function () {
                socketRequest.end()
            });
            socket.on('error', function () {
                socketRequest.write("HTTP/" + request.httpVersion + " 500 Connection error\r\n\r\n");
                socketRequest.end();
            });
            socketRequest.on('data', function (chunk) {
                socket.write(chunk, 'binary')
            });
            socketRequest.on('end', function () {
                socket.end()
            });
            socketRequest.on('error', function () {
                socket.end()
            });
        }).end();

    } else {

        var socket = net.createConnection({
            port: ph.port,
            localAddress:outgoingInterface,
            family: 6,
            host: this.resolveDns(ph.hostname)
        }, function () {
            socket.write(head);
            socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n")
        });
        socket.once('close',function(){
            /*npmFibers(function(){
                DynamicInterfaces.afterDisconnect(outgoingInterface);
            }).run();*/
            console.log('closed:',request.url);
        });

        socket.setTimeout(10 * 1000);
        socket.on('data', function (chunk) {
            socketRequest.write(chunk)
        });
        socket.on('end', function () {
            socketRequest.end()
        });
        socket.on('error', function () {
            /*npmFibers(function(){
                DynamicInterfaces.afterDisconnect(outgoingInterface);
            }).run();
            console.log('closed:',request.url);*/
            socketRequest.write("HTTP/" + request.httpVersion + " 500 Connection error\r\n\r\n");
            socketRequest.end();
        });
        socketRequest.on('data', function (chunk) {
            socket.write(chunk)
        });
        socketRequest.on('end', function () {
            socket.end()
        });
        socketRequest.on('error', function () {
            socket.end()
        });

    }
};

ProxyServer.prototype.getOutgoingInterface = function(authCredits){
    return this.proxy.outgoingInterface;
};

//inherits(ProxyServer, EventEmitter);