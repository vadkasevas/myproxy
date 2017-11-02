OutgoingInterfaceLoginProxyServer = function(proxy){
    ProxyServer.apply(this, arguments);
};
OutgoingInterfaceLoginProxyServer.prototype = Object.create(ProxyServer.prototype);

OutgoingInterfaceLoginProxyServer.prototype.checkAuthRequest = function(request){
    var proxy = this.proxy;
    if(!proxy.pass)
        return false;
    if(!isset(request.headers['proxy-authorization']))
        return false;

    try {
        var credits = request.headers['proxy-authorization'];
        if(/^basic\s+/gi.exec(credits)){
            credits = credits.replace(/^basic\s+/gi,'');
            credits = new Buffer(credits, 'base64').toString('utf8');
            var re = /(.*):([^:]+)/gi;
            var match = re.exec(credits);
            if(match){
                var login = match[1], pass = match[2];
                if (proxy.pass === pass){
                    delete( request.headers['proxy-authorization'] );
                    console.log( {login:login,pass:pass});
                    return {login:login,pass:pass};
                }
            }
        }
    }catch (e){
        console.log(e.trace);
    }

    return false;
};

OutgoingInterfaceLoginProxyServer.prototype.listen = function(){
    var proxyServer = this;
    var proxy = this.proxy;
    this.server = http.createServer(function(request, response) {
        npmFibers(function(){
            proxyServer.onRequest(request, response);
        }).run();
    }).on('connect', function(request, socketRequest, head) {
        npmFibers(function() {
            proxyServer.onConnect(request, socketRequest, head);
        }).run();
    }).on('error',function(err){
        console.log('HttpsProxyServer err:',err);
    }).
    listen(proxy.port,proxy.incomingInterface,2048,function(err,result){
        if(err){
            console.log(err);
        }
    });
};

OutgoingInterfaceLoginProxyServer.prototype.getOutgoingInterface = function(authCredits){
    return safeGet(authCredits,'login');
};


