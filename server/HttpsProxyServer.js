var assert = Meteor.npmRequire('assert');
var http = Meteor.npmRequire('http');
var net = Meteor.npmRequire('net');
var url = Meteor.npmRequire('url');

HttpsProxyServer = function(proxy){
    this.server = http.createServer(function(request, response) {

        console.log('REQUESTED:',request.url);
        var ph = url.parse(request.url);
        var options = {
            method: request.method,
            path: request.url,
            headers: request.headers || {},
            localAddress:proxy.outgoingInterface
        };
        if(safeGet(proxy,'backconnect.ip')){
            options.hostname = safeGet(proxy,'backconnect.ip');
            options.port = safeGet(proxy,'backconnect.port');
            var backconnectLogin = safeGet(proxy,'backconnect.login');
            if(backconnectLogin){
                var backconnectPass = safeGet(proxy,'backconnect.pass');
                options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(backconnectLogin+':'+backconnectPass).toString('base64');
            }
        }else{
            options.port = parseInt(ph.port);
            options.hostname = ph.hostname;
        }

        var gatewayRequest = http.request(options);
        gatewayRequest.on('error', function(err) { console.log('[error] ' , err) ; response.end() });
        gatewayRequest.on('response', function(gatewayResponse) {
            if(gatewayResponse.statusCode === 407) {
                console.log('[error] AUTH REQUIRED');
                return;
            }
            gatewayResponse.on('data', function(chunk) {
                response.write(chunk, 'binary');
            });
            gatewayResponse.on('end', function() { response.end() });
            response.writeHead(gatewayResponse.statusCode, gatewayResponse.headers);
        });
        request.on('data', function(chunk) {
            gatewayRequest.write(chunk, 'binary');
        });
        request.on('end', function() { gatewayRequest.end() });
        gatewayRequest.end();

    }).on('connect', function(request, socketRequest, head) {
        //console.log('CONNECT:',request.url);
        var ph = url.parse('http://' + request.url);

        if(safeGet(proxy,'backconnect.ip')){
            var options = {
                method: request.method,
                path: request.url,
                headers: request.headers || {},
                localAddress:proxy.outgoingInterface
            };
            options.hostname = safeGet(proxy,'backconnect.ip');
            options.port =  safeGet(proxy,'backconnect.port');
            var backconnectLogin = safeGet(proxy,'backconnect.login');
            if(backconnectLogin){
                var backconnectPass = safeGet(proxy,'backconnect.pass');
                options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(backconnectLogin+':'+backconnectPass).toString('base64');
            }

            var gatewayRequest = http.request(options);
            gatewayRequest.on('error', function(err) { console.log('[error] ' + err) ; });
            gatewayRequest.on('connect', function(res, socket, head) {
                socket.setTimeout(300*1000);
                socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n");
                socket.on('data', function(chunk) { socketRequest.write(chunk, 'binary') });
                socket.on('end', function() { socketRequest.end() });
                socket.on('error', function() {
                    socketRequest.write("HTTP/" + request.httpVersion + " 500 Connection error\r\n\r\n");
                    socketRequest.end();
                });
                socketRequest.on('data', function(chunk) { socket.write(chunk, 'binary') });
                socketRequest.on('end', function() { socket.end() });
                socketRequest.on('error', function() { socket.end() });
            }).end();

        }else{
            /*var socket = net.connect(ph.port, ph.hostname, function() {
                socket.write(head);
                socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n")
            });*/
            var socket = net.createConnection({
                port:ph.port,
                host: ph.hostname,
                localAddress: proxy.outgoingInterface
            }, function() {
                socket.write(head);
                socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n")
            });

            socket.setTimeout(300*1000);
            socket.on('data', function(chunk) { socketRequest.write(chunk) });
            socket.on('end', function() { socketRequest.end() });
            socket.on('error', function() {
                socketRequest.write("HTTP/" + request.httpVersion + " 500 Connection error\r\n\r\n");
                socketRequest.end();
            });
            socketRequest.on('data', function(chunk) { socket.write(chunk) });
            socketRequest.on('end', function() { socket.end() });
            socketRequest.on('error', function() { socket.end() });

        }


    }).listen(proxy.port,proxy.incomingInterface);
};

inherits(HttpsProxyServer, EventEmitter);