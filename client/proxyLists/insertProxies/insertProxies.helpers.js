Template.insertProxies.helpers({
    insertProxiesSchema:function(){
        return new SimpleSchema({
            ip: {type: String, label: 'IP'},
            'login':{type:String,optional:true,defaultValue:null},
            'pass':{type:String,optional:true,defaultValue:null},
            incomingInterface:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс (входящий трафик)'},
            outgoingInterfaceFrom:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс (исходящий трафик), от'},
            outgoingInterfaceTo:{type:String,optional:true,defaultValue:null,label:'Сетевой интерфейс (исходящий трафик), до'},

            allowedIps:{type:[String],defaultValue:[],optional:true,label:'Разрешенные ip'},
            'count':{type:Number,optional:true,defaultValue:1,min:1},
        });
    }
});