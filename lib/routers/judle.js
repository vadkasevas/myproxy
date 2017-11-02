Router.route('judle.php',function(){
        this.response.writeHead(200, {'Content-Type': 'application/json'});
        this.response.end(JSON.stringify(
            this.request.headers
        ));
    }, {
        where: 'server'
    }
);