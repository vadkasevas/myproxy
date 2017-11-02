Meteor.startup(function() {

    this.proxyListsPage = new Meteor.Pagination(ProxyLists,{
        itemTemplate: "proxyListRow",
        templateName:"proxyListsTable",
        perPage: 10,
        table:{
            class: "table",
            fields: ['name'],
            header: [
                ProxyLists.schema.label('name') ,
                'Общее кол-во прокси',
                'Кол-во активных прокси',
            ],
            wrapper: "table-wrapper"
        },
    });

});