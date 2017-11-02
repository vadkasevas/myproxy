if(Meteor.isServer){
    var BigInteger = Meteor.npmRequire('jsbn').BigInteger;
    var Address6 = Meteor.npmRequire('ip-address').Address6;

    Meteor.methods({
        insertToProxyList:function(proxyListId,data){
            var proxyList = ProxyLists.findOne({_id:proxyListId});
            if(!proxyList)
                throw new Error('Указанный список прокси не найден');

            var port = Proxies.findPort(data.incomingInterface);
            var findPort = function(){
                while(true) {
                    port++;
                    if (portScanner.checkPortStatusSync(port, data.incomingInterface) == 'closed') {
                        return port;
                    }
                }
            };

            var count = data.count;
            var proxies = [];
            var addressFrom = new Address6(data.outgoingInterfaceFrom.toLowerCase());
            var addressTo = new Address6(data.outgoingInterfaceTo.toLowerCase());

            console.log('start address:', addressFrom.startAddress().canonicalForm());
            console.log('end address:', addressTo.endAddress().canonicalForm());


            var d = addressTo.bigInteger().subtract(addressFrom.bigInteger());
            var div = d.divide(new BigInteger(String(count)));
            for (var i = 1; i <= count; i++) {
                var add = div.multiply(new BigInteger(String(i)));
                var bnAddress = addressFrom.bigInteger().add(add);
                var newAddress = Address6.fromBigInteger(bnAddress).canonicalForm();

                proxies.push({
                    proxy_list_id:proxyListId,
                    ip:data.ip,
                    port:findPort(),
                    protocol:Proxies.PROTOCOL_HTTP,
                    login:data.login,
                    pass:data.pass,
                    incomingInterface:data.incomingInterface,
                    outgoingInterface:newAddress,
                    allowedIps:data.allowedIps,
                });
                Meteor.sleep(1);
            }

            Proxies.batchInsert(proxies);

            return count;
        }
    });
}