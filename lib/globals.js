if(Meteor.isServer){
    http = Meteor.npmRequire('http');
    net = Meteor.npmRequire('net');
    url = Meteor.npmRequire('url');

    inherits = Npm.require('util').inherits;
    npmFs = Meteor.npmRequire('fs');
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


    _exec = Meteor.npmRequire('child_process').exec;

    exec = Meteor.wrapAsync(
        function(cmd,cb){
            _exec(cmd, {maxBuffer: 1024 * 1024*10},function (error, stdout, stderr) {
                npmFibers(
                    function(){
                        cb(error,stdout, stderr);
                    }
                ).run();

            });
        }
    );

    execSync = Meteor.npmRequire('child_process').execSync;


    Address6 = Meteor.npmRequire('ip-address').Address6;

}