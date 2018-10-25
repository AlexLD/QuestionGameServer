const mongoClient = require('mongodb').MongoClient;

let cachedDb = null;

connectToDb = ()=>{
    if(cachedDb && cachedDb.serverConfig.isConnected()){
        console.log("=> using cached mongodb connection");
        return Promise.resolve(cachedDb);
    }
    console.log("=> new db connection");
    return mongoClient.connect(process.env.MONGODB_ATLAS_CLUSTER_URI, {useNewUrlParser:true}).then(client=>{
        cachedDb = client.db("SFCC");
        return cachedDb;
    })
}

module.exports = connectToDb;