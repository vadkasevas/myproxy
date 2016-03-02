Proxies.schema = new SimpleSchema({
    _id: {type: String, optional: true},
    proxy_list_id: {type: String, label: ''},
    protocol:{type:String,optional:true,defaultValue:Proxies.PROTOCOL_HTTP},
    ip: {type: String, label: 'IP'},
    port: {type: Number, label: 'Порт'},
    incomingInterface:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс'},
    outgoingInterface:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс'},

    'backconnect.ip':{type:String,optional:true,defaultValue:null},
    'backconnect.port':{type:Number,optional:true,defaultValue:null},
    'backconnect.login':{type:String,optional:true,defaultValue:null},
    'backconnect.pass':{type:String,optional:true,defaultValue:null},
});