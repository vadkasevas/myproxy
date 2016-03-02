FreeProxies = new Mongo.Collection('freeProxies');

Meteor.startup(function(){
    FreeProxies.attachSchema(FreeProxies.schema);
});