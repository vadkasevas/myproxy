DynamicInterfacesClass = function(){
    EventEmitter.call(this);
    this.setMaxListeners(1000000);
    this.queue = new PowerQueue({maxProcessing:20,autostart:true});
    this.opened = {};
    this.openQueue = {};
    this.closeQueue = {};
    this.socketCounts = {};
    this.staticIps = {};


    exec('/sbin/ifconfig -a',function(err,oBuffer,eBuffer){
     // exec('echo ddd 2a04:5200:4:ff4:d029:ffff:ffff:f010/128 Scope:Global',function(err,oBuffer,eBuffer){
        var res = [ /([a-f0-9:]+)\/64/gi , /([a-f0-9:]+)\/128/gi];
        if(oBuffer) {
            _.each(res,function(re){
                _.each([oBuffer.toString('utf8')], function (s) {
                    while (true) {
                        var match = re.exec(s);
                        if (match) {
                            try {
                                var address = new Address6(match[0]);
                                DynamicInterfaces.staticIps[address.correctForm()] = 1;
                                DynamicInterfaces.staticIps[address.canonicalForm()] = 1;
                            } catch (e) {
                                console.log(e);
                            }
                        } else
                            break;
                    }
                });
            });

        }

        //console.log('ifconfig err:',err);
        //console.log('ifconfig oBuffer:',oBuffer);
       // console.log('ifconfig eBuffer:',eBuffer);


        console.log('staticIps count:',objectSize( DynamicInterfaces.staticIps) );
    });



    this.on('opened',function(ipv6){
        this.opened[ipv6] = 1;
        delete this.openQueue[ipv6];
    });

    this.on('closed',function(ipv6){
        if(this.opened[ipv6])
            delete this.opened[ipv6];
        if(this.openQueue[ipv6])
            delete this.openQueue[ipv6];
        delete this.closeQueue[ipv6];
    });

    this.beforeConnection = function(ipv6){
        if(ipv6&&!isset(this.staticIps[ipv6])) {
            if (!isset(this.opened[ipv6]))
                this.open(ipv6);
            if (!isset(this.socketCounts[ipv6]))
                this.socketCounts[ipv6] = 1;
            else {
                this.socketCounts[ipv6]++;
            }
        }
    };

    this.afterDisconnect = function(ipv6){
        return;
        if(ipv6&&!isset(this.staticIps[ipv6])) {
            if (isset(this.socketCounts[ipv6])) {
                this.socketCounts[ipv6]--;
                if (this.socketCounts[ipv6] < 1) {
                    this.removeIpv6(ipv6);
                }
            }
        }
    };

    this.getSocketsCount = function(ipv6){
        if(isset(this.socketCounts[ipv6]))
            return this.socketCounts[ipv6];
        return 0;
    };

    this.open = function(ipv6){
        if(this.closeQueue[ipv6]){
            var f = Meteor.wrapAsync(function(){
                DynamicInterfaces.once('closed'+ipv6,function(){
                    callback(null,true);
                });
            });
            f();
        }
        if(isset(this.opened[ipv6]))
            return true;
        if(this.openQueue[ipv6]){
            var f = Meteor.wrapAsync(function(callback){
                DynamicInterfaces.once('opened'+ipv6,function(){
                    callback(null,true);
                });
            });
            return f();
        }else{
            this.openQueue[ipv6] = 1;
            var f = Meteor.wrapAsync(function(ipv6,callback) {
                DynamicInterfaces.queue.add(function (done) {
                    Meteor.setTimeout(function () {
                        exec('ip -6 addr add ' + ipv6 + ' dev eth'+rndInt(1,13),function(){
                            done();
                            Meteor.setTimeout(function(){
                                console.log('ip addr added:',ipv6);
                                DynamicInterfaces.emit('opened'+ipv6,ipv6);
                                DynamicInterfaces.emit('opened',ipv6);
                                callback(null,true);
                            },5000);
                        });

                    }, 1);
                });
            });
            return f(ipv6);
        }

    };

    this.removeIpv6 = function(ipv6){
        return;
        if(this.openQueue[ipv6]){
            var f = Meteor.wrapAsync(function(){
                DynamicInterfaces.once('opened'+ipv6,function(){
                    callback(null,true);
                });
            });
            f();
        }
        if(!isset(this.opened[ipv6]))
            return true;
        if(this.closeQueue[ipv6]){
            var f = Meteor.wrapAsync(function(callback){
                DynamicInterfaces.once('closed'+ipv6,function(){
                    callback(null,true);
                });
            });
            return f();
        }else{
            this.closeQueue[ipv6] = 1;
            var f = Meteor.wrapAsync(function(ipv6,callback) {
                DynamicInterfaces.queue.add(function (done) {
                    Meteor.setTimeout(function () {
                        exec('ip addr del ' + ipv6 + '/64 dev eth0',function(){
                            console.log('ip addr deleted:',ipv6);
                            DynamicInterfaces.emit('closed'+ipv6,ipv6);
                            DynamicInterfaces.emit('closed',ipv6);
                            done();
                            callback(null,true);
                        });

                    }, 1);
                });
            });
            return f(ipv6);
        }
    }


};

inherits(DynamicInterfacesClass, EventEmitter);

DynamicInterfaces = new DynamicInterfacesClass();
