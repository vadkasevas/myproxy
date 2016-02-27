if(Meteor.isServer){
    inherits = Npm.require('util').inherits;
    npmFs = Meteor.npmRequire('fs');
    httpProxy = Meteor.npmRequire('http-proxy');

    portScanner = Meteor.npmRequire('portscanner');

    portScanner.checkPortStatusSync = Meteor.wrapAsync(portScanner.checkPortStatus);

}