Router.configure({
    layoutTemplate: 'siteLayout',
    progressTick : false
    //waitOn: function() {  }
});

var OnBeforeActions = {
    loginRequired: function(pause) {
        if(this.options&&this.options.route&&this.options.route.handler&&this.options.route.handler
            &&this.options.route.handler.where&&this.options.route.handler.where.toLowerCase()=='server') {
            this.next();
            return;
        }

        if (!Meteor.isAdmin()) {
            this.render('notFound');
            return false;
        }
        this.next();
    }
};


Router.onBeforeAction(OnBeforeActions.loginRequired);
