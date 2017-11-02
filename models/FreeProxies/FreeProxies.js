FreeProxies = new Mongo.Collection('freeProxies');

Meteor.startup(function(){
    FreeProxies.attachSchema(FreeProxies.schema);
});

FreeProxies.helpers({
    calcDelay:function(){
        var sum = 0;
        _.each(this.checks,function(check){
            sum+=check.delay;
        });
        return Math.round( sum / this.checks.length );
    },
    calcSuccessPercent:function(){
        var sum = 0;
        _.each(this.requests,function(request){
            if(request.success)
                sum+=1;
        });
        return Math.round( sum * 100 / this.requests.length );
    }
});

if(Meteor.isServer){
    FreeProxies.autofill = function(){
        console.log('FreeProxies.find({}).count():',FreeProxies.find().count());
        if(FreeProxies.find({}).count()==0){
            HttpClient.waitFreeProxies(function(){
                _.each(HttpClient.freeProxies,function(proxy){
                    FreeProxies.insert({
                        _id:proxy.ip+':'+proxy.port,
                        ip:proxy.ip,
                        port:proxy.port,
                        protocol:FreeProxies.PROTOCOL_HTTP,
                        active:true,
                        delay:0,
                        successPercent:0,
                        anonimity:FreeProxies.ANONIMITY_TRANSPARENT,
                        referer:false,
                        userAgent:false,
                        cookies:false,
                        getParams:true,
                        postData:true,
                        requests:[],
                        checks:[],
                    });
                });
            });
        }
    }
}