Proxies = new Mongo.Collection('proxies');

Proxies.PROTOCOL_HTTP = 'http';
//Proxies.PROTOCOL_HTTPS = 'https';
Proxies.PROTOCOL_SOCKS = 'socks';

Meteor.startup(function(){
    Proxies.attachSchema(Proxies.schema);
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