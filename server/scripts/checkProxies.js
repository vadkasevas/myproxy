Meteor.startup(function(){

    var queue = new PowerQueue({maxProcessing:10});

    var urlData = HttpClient.urlParser.parse(process.env.ROOT_URL,true,true);
    var httpJudleUrl = 'http://'+urlData.hostname+":8080/judle.php?rnd="+generateRandomHash();
    var httpsJudleUrl = 'https://'+urlData.hostname+":8081/judle.php?rnd="+generateRandomHash();

    HttpClient.waitFreeProxies(function(){
        _.each(HttpClient.freeProxies,function(freeProxy){
            var proxy = {ip:freeProxy.ip,port:freeProxy.port,protocol:freeProxy.protocol};
            if(proxy.protocol==FreeProxies.PROTOCOL_HTTPS)
                proxy.protocol = FreeProxies.PROTOCOL_HTTP;
            queue.add(function(done){
                Meteor.setTimeout(function(){
                    var testProxy = function(url){
                        var checkStarted = getNowTime();
                        var referer = 'http://google.ru';
                        var userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0';
                        var client = new HttpClient(url);
                        client.withHttpMethod(HttpClient.METHOD_POST);
                        client.withPostData({
                            postKey1:'postValue1',
                            postKey2:'postValue2'
                        });
                        client.withCookie(new HttpClient.Cookie({key:'cookieKey','value':'cookieValue',domain:null,path:'/',expires:null}));
                        client.useCookies = true;
                        client.withProxy(proxy);
                        client.withHeader('User-Agent',userAgent);
                        client.withHeader('Accept','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
                        client.withHeader('Referer',referer);
                        client.once('success',function(content){
                            console.log(safeGet(content,'content'));
                        });
                        try{
                            var content = client.asyncExec();
                            var data = safeGet(content,'data');
                            if(data){
                                var result = {};
                                result.active = true;
                                result.referer = safeGet(data,'referer')==referer;
                                result.userAgent = safeGet(data,'user-agent')==userAgent;
                                result.cookies = !!safeGet(data,'cookies');
                                result.getParams = isset( safeGet(data,'getParams.rnd') );
                                result.postData = isset( safeGet(data,'postData') );
                                if(!isset(data['x-forwarded-for'])&&!isset(data['via'])){
                                    result.anonimity = FreeProxies.ANONIMITY_HIGH;
                                }else if(!isset(data['x-forwarded-for'])){
                                    result.anonimity = FreeProxies.ANONIMITY_LOW;
                                }else
                                    result.anonimity = FreeProxies.ANONIMITY_TRANSPARENT;
                                result.delay = getNowTime() - checkStarted;
                                return result;
                            }
                            return content.data;
                        }catch(e){
                            return false;
                        }
                    };

                    var httpTest = testProxy(httpJudleUrl);
                    var httpsTest = false;
                    /*if(httpTest){
                        httpsTest = testProxy(httpsJudleUrl);
                        for(var i=0;i<5;i++){
                            httpsTest = testProxy(httpsJudleUrl);
                            if(httpsTest)
                                break;
                        }
                    }*/

                    var check = {
                        date:new Date(),
                        active:safeGet(httpTest,'active',false) || safeGet(httpsTest,'active',false),
                        delay:safeGet(httpTest,'delay',0) || safeGet(httpsTest,'delay',0),
                        referer:safeGet(httpTest,'referer',false) || safeGet(httpsTest,'referer',false),
                        userAgent:safeGet(httpTest,'userAgent',false) || safeGet(httpsTest,'userAgent',false),
                        cookies:safeGet(httpTest,'cookies',false) || safeGet(httpsTest,'cookies',false),
                        getParams:safeGet(httpTest,'getParams',false) || safeGet(httpsTest,'getParams',false),
                        postData:safeGet(httpTest,'postData',false) || safeGet(httpsTest,'postData',false),
                        anonimity:safeGet(httpTest,'anonimity','') || safeGet(httpsTest,'anonimity','') || freeProxy.anonimity || FreeProxies.ANONIMITY_TRANSPARENT
                    };



                    var protocol = null;

                    if(httpTest||httpsTest) {
                        if (!httpsTest)
                            protocol = FreeProxies.PROTOCOL_HTTP;
                        else
                            protocol = FreeProxies.PROTOCOL_HTTPS;
                    }







                    console.log('ip',proxy.ip,'protocol:',protocol,'check:',check);

                    done();
                },100);


            });
        });
    });

});