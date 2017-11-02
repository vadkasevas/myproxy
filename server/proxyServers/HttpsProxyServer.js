var http = Meteor.npmRequire('http');
var net = Meteor.npmRequire('net');
var url = Meteor.npmRequire('url');

HttpsProxyServer = function(proxy){
    ProxyServer.apply(this, arguments);
};
HttpsProxyServer.prototype = Object.create(ProxyServer.prototype);

HttpsProxyServer.prototype.listen = function(){
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
    listen(proxy.port,proxy.incomingInterface,511,function(err,result){
        if(err){
            console.log(err);
        }
    });
};
