FreeProxies.schema = new SimpleSchema({
    _id: {type: String, optional: true},
    protocol:{type:String,optional:true,defaultValue:FreeProxies.PROTOCOL_HTTP},
    ip: {type: String, label: 'IP'},
    port: {type: Number, label: 'Порт'},
    active:{type:Boolean,label:'Статус',optional:true,defaultValue:true},

    delay:{type:Number,label:'Средняя задержка',optional:true,defaultValue:0},
    successPercent:{type:Number,label:'% Успешности',optional:true,defaultValue:0},
    checkDate:{type:Date,label:'Время проверки'},

    'anonimity':{type:String,label:'Анонимность'},
    'referer':{type:Boolean,label:'Реферер'},
    'userAgent':{type:Boolean,label:'Юзерагент'},
    'cookies':{type:Boolean,label:'Кукис'},
    'getParams':{type:Boolean,label:'GET'},
    'postData':{type:Boolean,label:'POST'},

    'checks.$.date':{type:Date,label:'Время проверки'},
    'checks.$.active':{type:Boolean,label:'Результат проверки'},
    'check.$.delay':{type:Number,label:'Задержка'},
    'check.$.anonimity':{type:String,label:'Анонимность'},
    'check.$.referer':{type:Boolean,label:'Реферер'},
    'check.$.userAgent':{type:Boolean,label:'Юзерагент'},
    'check.$.cookies':{type:Boolean,label:'Кукиес'},
    'check.$.getParams':{type:Boolean,label:'GET'},
    'check.$.postData':{type:Boolean,label:'POST'},

});

FreeProxies.PROTOCOL_HTTP = 'http';
FreeProxies.PROTOCOL_HTTPS = 'https';
FreeProxies.PROTOCOL_SOCKS = 'socks';
FreeProxies.PROTOCOL_SOCKS4 = 'socks4';
FreeProxies.PROTOCOL_SOCKS5 = 'socks5';

FreeProxies.ANONIMITY_HIGH = 'high';
FreeProxies.ANONIMITY_LOW = 'low';
FreeProxies.ANONIMITY_TRANSPARENT = 'transparent';