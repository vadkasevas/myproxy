if(Meteor.isServer){
    inherits = Npm.require('util').inherits;
    npmFs = Meteor.npmRequire('fs');
    httpProxy = Meteor.npmRequire('http-proxy');
    npmFibers = Meteor.npmRequire('fibers');

    npmAsync = Meteor.npmRequire('async');
    meteorAsync = {
        parallel:function(fs,callback){
            var wrappedFs = [];
            _.each(fs,function(_f,index){
                wrappedFs[index] = function(callback){
                    npmFibers(function () {
                        _f(callback);
                    }).run();
                };
            });
            var wrappedCallback = function(){
                var _args = arguments;
                npmFibers(function(){
                    callback.apply(null,_args);
                }).run();
            };
            return npmAsync.parallel(wrappedFs,wrappedCallback);
        }
    };

    portScanner = Meteor.npmRequire('portscanner');

    portScanner.checkPortStatusSync = Meteor.wrapAsync(portScanner.checkPortStatus);

}