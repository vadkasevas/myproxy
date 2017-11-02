ProxyServerFactory = {
    getProxyServer:function(proxy){
        if(proxy.proxyType==Proxies.PROXY_TYPE_OUTGOING_INTERFACE_LOGIN){
            return new OutgoingInterfaceLoginProxyServer(proxy);
        }
        //if(proxy.proxyType==Proxies.PROXY_TYPE_DEFAULT)
            return new HttpsProxyServer(proxy);
    }
};