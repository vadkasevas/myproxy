Cluster = {testMode:false,CLUSTER_WORKERS_COUNT:6};


if(Meteor.isServer) {
    Cluster.isMaster = function () {
        if (Cluster.testMode)
            return false;
        return !isset(process.env.CLUSTER_WORKER_ID);
    };

    Cluster.isWorker = function () {
        if (Cluster.testMode)
            return true;
        return Cluster.workerId() > 0;
    };

    Cluster.workerId = function () {
        if (Cluster.testMode)
            return 1;
        return Number(process.env.CLUSTER_WORKER_ID);
    };

    Cluster.isServer = function () {
        if (Cluster.testMode)
            return true;
        return isset(process.env.isServer) && ( Number(process.env.isServer) == 1);
    };

    Cluster.getState = function () {
        if (Cluster.isWorker())
            return 'CWorker ' + Cluster.workerId();
        else if (Cluster.isServer())
            return 'CServer ';
        else
            return 'CClient';
    }
}