ProxyLists = new Mongo.Collection("proxy_lists");

Meteor.startup(
    function() {
        if (Meteor.isServer) {
            Meteor.publish(
                'ProxyLists',
                function () {
                    return ProxyLists.find();
                }
            );
            Meteor.publish(
                'ProxyListById',
                function (_id) {
                    return ProxyLists.find({_id: _id});
                }
            );

        }

        ProxyLists.attachSchema(ProxyLists.schema);
    }
);
