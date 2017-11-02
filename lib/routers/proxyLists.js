Router.route('/proxyLists',{
    template:'proxyListsIndex',
    parent:'index',
    name:'proxyListsIndex',
    title:'Все списки прокси',
    onAfterAction: function() {
        SEO.set({ title: 'Прокси | Все списки прокси' });
    }
});

Router.route('/proxyList/create',{
    template:'proxyListCreate',
    parent:'proxyListsIndex',
    name:'proxyListCreate',
    title:'Создать новый список прокси',
    onAfterAction: function() {
        SEO.set({ title: 'Прокси | Создать новый список прокси' });
    }
});

Router.route('/proxyList/update/:_id',{
        template:'proxyListUpdate',
        parent:'proxyListsIndex',
        name:'proxyListUpdate',
        title:'Изменить список прокси ":name"',

        waitOn:function(){
            return [
                Meteor.subscribe('ProxyListById',this.params._id),
            ];
        },
        data : function () {
            var model = ProxyLists.findOne({_id : this.params._id});
            this.params.name = safeGet(model,'name','');
            return model;
        },
        onAfterAction: function() {
            var data = this.data();
            var name = safeGet(data,'name','');
            SEO.set({ title: 'Прокси | Изменить список прокси "'+name +'"' });
        }
    }
);

Router.route('/proxyList/insertProxies/:_id',{
    template:'insertProxies',
    parent:'proxyListsIndex',
    name:'insertProxies',
    title:'Добавить прокси в список ":name"',
    waitOn:function(){
        return [
            Meteor.subscribe('ProxyListById',this.params._id),
        ];
    },
    data : function () {
        var model = ProxyLists.findOne({_id : this.params._id});
        Session.set('proxyList',model);
        this.params.name = safeGet(model,'name','');
        return model;
    },
    onAfterAction: function() {
        var data = this.data();
        var name = safeGet(data,'name','');
        SEO.set({ title: 'Прокси | Добавить прокси в список "'+name+'"' });
    }
});