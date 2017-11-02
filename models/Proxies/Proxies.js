Proxies = new Mongo.Collection('proxies');

Proxies.PROTOCOL_HTTP = 'http';
Proxies.PROTOCOL_SOCKS = 'socks';
Proxies.PROTOCOL_SOCKS4 = 'socks4';
Proxies.PROTOCOL_SOCKS5 = 'socks5';

Proxies.PROXY_TYPE_DEFAULT = 'PROXY_TYPE_DEFAULT';
Proxies.PROXY_TYPE_OUTGOING_INTERFACE_LOGIN = 'PROXY_TYPE_OUTGOING_INTERFACE_LOGIN';

Meteor.startup(function(){
    Proxies.attachSchema(Proxies.schema);
    if(Meteor.isServer){
        Meteor.publish(
            'ProxyById',
            function(_id){
                return Proxies.find({_id:_id});
            }
        );

    }
});

Proxies.autofill = function(){
    var localPort = 1024;
    if(Proxies.find().count()==0){
        _.each(HttpClient.freeProxies,function(freeProxy){
            Proxies.insert({
                proxy_list_id: 'test',
                ip: '192.168.1.111',
                port: localPort++,
                incomingInterface:'192.168.1.111',
                outgoingInterface:'192.168.1.111',
                backconnect:{
                    ip:freeProxy.ip,
                    port:freeProxy.port,
                    login:'',
                    pass:'',
                }
            });
        });
    }
};

Proxies.findPort = function(incomingInterface){
    var port = 4000;
    var proxy = Proxies.findOne({}, {fields:{port:1},sort:{port:-1}});
    if(proxy&&proxy.port){
        port = proxy.port;
    }
    while(true){
        port++;
        if(portScanner.checkPortStatusSync(port, incomingInterface) == 'closed') {
            return port;
        }
    }
};

Proxies.serialize = function(proxy){
    var result = proxy.ip+':'+proxy.port;
    if(proxy.login)
        result+'@'+proxy.login+':'+proxy.pass;
    return result;
};