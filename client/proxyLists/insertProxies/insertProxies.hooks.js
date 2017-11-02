AutoForm.hooks({
    insertProxiesForm:{
        /*before:{
            submit: function(insertDoc, updateDoc, currentDoc) {
                console.log('submit');
                console.log('insertDoc='+stringify( insertDoc ) );
                console.log('updateDoc='+stringify( updateDoc ) );
                console.log('currentDoc='+stringify( currentDoc ) );
                // You must call this.done()!
                //this.done(); // submitted successfully, call onSuccess
                //this.done(new Error('foo')); // failed to submit, call onError with the provided error
                //this.done(null, "foo"); // submitted successfully, call onSuccess with `result` arg set to "foo"
            },
        },*/
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            var proxyList = Session.get('proxyList');
            Meteor.call('insertToProxyList',proxyList._id,insertDoc,function(err,result){
                if(err){
                    alert(err);
                }else{
                    alert('Вставлено '+result+' прокси');
                }
            });

            console.log('insertDoc:',insertDoc);
            console.log('updateDoc:',updateDoc);
            console.log('currentDoc:',currentDoc);
            return false;
        },
    }
});