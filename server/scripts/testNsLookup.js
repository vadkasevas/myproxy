Meteor.startup(function(){
    var nslookup = Meteor.npmRequire('nslookup');
    nslookup('instagram.com')
        .server('8.8.8.8') // default is 8.8.8.8
        .type('ANY') // default is 'a'
        .timeout(10 * 1000) // default is 3 * 1000 ms
        .end(function (err, addrs) {
            console.log(addrs); // => ['66.6.44.4']
        });

});