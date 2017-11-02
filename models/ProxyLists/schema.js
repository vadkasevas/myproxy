ProxyLists.schema = new SimpleSchema({
    name:{type:String,label:'Имя списка прокси'},
    created: Schemas.created('Время создания'),
    updated: Schemas.updated('Последнее изменение'),
});