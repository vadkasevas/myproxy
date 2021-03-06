Meteor.startup(function(){
    return;
    var Busboy = Meteor.npmRequire('busboy');
    var judlePortHttp = 3001;
    var judlePortHttps = 3002;

    var parseCookies = function (request) {
        var list = {},
            rc = request.headers.cookie;

        rc && rc.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

        return list;
    };

    var requestCallback = function(request,response){
        npmFibers(function(){

            var postData = {};
            if (request.method == 'POST') {
                var f = Meteor.wrapAsync(function(callback){
                    callback = _.once(callback);
                    var busboy = new Busboy({ headers: request.headers });
                    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                        postData[fieldname] = val;
                    });
                    busboy.on('finish', function() {
                        npmFibers(function(){
                            callback(null,null);
                        }).run();
                    });
                    busboy.on('error',function(){
                        npmFibers(function(){
                            callback(null,null);
                        }).run();
                    });
                    request.pipe(busboy);
                });
                f();
            }

            var urlData = HttpClient.urlParser.parse(request.url,true);
            switch (urlData.pathname) {
                case "/judle.php":
                    delete request.headers['content-type'];
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    response.write(JSON.stringify(
                        _.extend({},request.headers,{getParams:urlData.query,cookies:parseCookies(request),postData:postData})
                    ));
                    break;
                case "/ip.php":
                    response.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    response.write('request.connection.remoteAddress:'+request.connection.remoteAddress);
                    break;
            }
            response.end();
        }).run();

    };

    judleServer = Meteor.npmRequire('http').createServer(requestCallback);
    judleServer.listen(judlePortHttp,'2a04:5200:0004::2');


    var judleHttpsServer = Meteor.npmRequire('https').createServer({
        key: npmFs.readFileSync( process.env.PWD+ '/server/keys/key.pem'),
        cert: npmFs.readFileSync( process.env.PWD+ '/server/keys/cert.pem')
    }, requestCallback);
    judleHttpsServer.listen(judlePortHttps,'2a04:5200:0004::2');
});



