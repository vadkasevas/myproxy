Router.route('/',{
    name:'index',
    title:'Главная',
    template:'siteIndex',
    onAfterAction: function() {
        //SEO.set({ title: 'Спамец | Главная' });
    }
});