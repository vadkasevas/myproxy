Proxies.schema = new SimpleSchema({
    _id: {type: String, optional: true},
    workerId:{type:Number,optional:true,defaultValue:null,label:'Воркер'},
    proxy_list_id: {type: String, label: '',optional:true,defaultValue:null},
    proxyType:{type:String,
        label:'Тип прокси',
        optional:true,
        defaultValue:Proxies.PROXY_TYPE_DEFAULT,
        allowedValues: [Proxies.PROXY_TYPE_DEFAULT,Proxies.PROXY_TYPE_OUTGOING_INTERFACE_LOGIN],
        autoform: {
            options: [
                {
                    label: "Обычный прокси",
                    value: Proxies.PROXY_TYPE_DEFAULT
                },
                {
                    label: "Логин пользователя - это сетевой интерфейс для исходящего трафика",
                    value: Proxies.PROXY_TYPE_OUTGOING_INTERFACE_LOGIN,
                }
            ]
        }
    },
    protocol:{type:String,optional:true,defaultValue:Proxies.PROTOCOL_HTTP},
    ip: {type: String, label: 'IP'},
    port: {type: Number, label: 'Порт',optional:true,defaultValue:null},
    'login':{type:String,optional:true,defaultValue:null},
    'pass':{type:String,optional:true,defaultValue:null},
    incomingInterface:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс (входящий трафик)'},
    outgoingInterface:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс (исходящий трафик)'},
    allowedIps:{type:[String],defaultValue:[],optional:true,label:'Разрешенные ip'},
    'backconnect.ip':{type:String,optional:true,defaultValue:null},
    'backconnect.port':{type:Number,optional:true,defaultValue:null},
    'backconnect.login':{type:String,optional:true,defaultValue:null},
    'backconnect.pass':{type:String,optional:true,defaultValue:null},

});

if(Meteor.isServer){
    Meteor.startup(function(){
        Proxies._ensureIndex({'port': 1});
        Proxies._ensureIndex({'proxyType': 1});
        Proxies._ensureIndex({'workerId': 1});
        Proxies.update({proxyType:{$exists:false}}, {$set:{proxyType:Proxies.PROXY_TYPE_DEFAULT}} ,{multi:true,validate:false});
    });
}