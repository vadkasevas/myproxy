FreeProxies.schema = new SimpleSchema({
    _id: {type: String, optional: true},
    protocol:{type:String,optional:true,defaultValue:FreeProxies.PROTOCOL_HTTP},
    ip: {type: String, label: 'IP'},
    port: {type: Number, label: 'Порт'},
    active:{type:Boolean,label:'Статус',optional:true,defaultValue:true},

    delay:{type:Number,label:'Средняя задержка',optional:true,defaultValue:0},
    successPercent:{type:Number,label:'% Успешности',optional:true,defaultValue:0},

    'anonimity':{type:String,label:'Анонимность'},
    'referer':{type:Boolean,label:'Реферер'},
    'userAgent':{type:Boolean,label:'Юзерагент'},
    'cookies':{type:Boolean,label:'Кукис'},
    'getParams':{type:Boolean,label:'GET'},
    'postData':{type:Boolean,label:'POST'},

    'requests.$.date':{type:Date,label:'Время запроса'},
    'requests.$.success':{type:Boolean,label:'Удачно'},

    'checks.$.date':{type:Date,label:'Время проверки'},
    'checks.$.active':{type:Boolean,label:'Результат проверки'},
    'checks.$.delay':{type:Number,label:'Задержка'},
    'checks.$.anonimity':{type:String,label:'Анонимность'},
    'checks.$.referer':{type:Boolean,label:'Реферер'},
    'checks.$.userAgent':{type:Boolean,label:'Юзерагент'},
    'checks.$.cookies':{type:Boolean,label:'Кукиес'},
    'checks.$.getParams':{type:Boolean,label:'GET'},
    'checks.$.postData':{type:Boolean,label:'POST'},

    'google.date':{type:Date,label:'Дата поиска в гугле',optional:true,defaultValue:null},
    'google.locked':{type:Boolean,label:'Залочен',optional:true,defaultValue:false},

    'check.date':{type:Date,label:'Дата проверки',optional:true,defaultValue:null},
    'check.locked':{type:Boolean,label:'Залочен',optional:true,defaultValue:false},


});

FreeProxies.PROTOCOL_HTTP = 'http';
FreeProxies.PROTOCOL_HTTPS = 'https';
FreeProxies.PROTOCOL_SOCKS = 'socks';
FreeProxies.PROTOCOL_SOCKS4 = 'socks4';
FreeProxies.PROTOCOL_SOCKS5 = 'socks5';

FreeProxies.ANONIMITY_HIGH = 'high';
FreeProxies.ANONIMITY_LOW = 'low';
FreeProxies.ANONIMITY_TRANSPARENT = 'transparent';

if(Meteor.isServer){
    Meteor.startup(function(){
        FreeProxies._ensureIndex({'active': 1});

        FreeProxies._ensureIndex({'check.date': 1});
        FreeProxies._ensureIndex({'check.locked': 1});

        FreeProxies._ensureIndex({'google.date': 1});
        FreeProxies._ensureIndex({'check.locked': 1});

    });
}

