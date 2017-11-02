Meteor.startup(function(){
return;
    HttpClient.waitFreeProxies(function(){
        Proxies.autofill();

        proxyServers = [];

        _.each( Proxies.find({},{limit:10000}).fetch(),function(proxy){
            try {
                if( portScanner.checkPortStatusSync(proxy.port,proxy.ip)=='closed') {
                    var proxyServer = new HttpsProxyServer(proxy);
                    proxyServers.push(proxyServer);
                }
            }catch(e){
                console.log('port:',proxy.port,e);
            }

            var httpClient = new HttpClient('https://www.instagram.com/');
            httpClient.timeout = 300*1000;
            httpClient.withProxy(proxy);
            //httpClient.withProxy({ip:proxy.backconnect.ip,port:proxy.backconnect.port,protocol:proxy.protocol});
            var onResponse = function (content) {
                var re = /\d+\.\d+\.\d+\.\d+/;
                re = /marksimonson/;
                var match = re.exec(safeGet(content,'content',''));
                if(match){
                    console.log('ip:',proxy.ip+':'+proxy.port);
                }
            };
            httpClient.once('success', onResponse );
            httpClient.once('error', function (err, content) {
                onResponse(content);
            });
            httpClient.execute();

        });


        /*_.each( Proxies.find().fetch(),function(proxy){
            var httpClient = new HttpClient('https://www.instagram.com/');
            httpClient.timeout = 300*1000;
            httpClient.withProxy(proxy);
            //httpClient.withProxy({ip:proxy.backconnect.ip,port:proxy.backconnect.port,protocol:proxy.protocol});
            var onResponse = function (content) {
                var re = /\d+\.\d+\.\d+\.\d+/;
                re = /marksimonson/;
                var match = re.exec(safeGet(content,'content',''));
                if(match){
                    console.log('ip:',match[0]);
                }else{
                    console.log(safeGet(content,'content',''));
                }
            };
            httpClient.once('success', onResponse );
            httpClient.once('error', function (err, content) {
                onResponse(content);
            });
            httpClient.execute();
        });*/


    });

});