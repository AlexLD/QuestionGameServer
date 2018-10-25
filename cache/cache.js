const NodeCache = require('node-cache');
const connectToDb = require('../accounts/mongodb');
const ObjectId = require('mongodb').ObjectId;

class cache {
    constructor(ttlSeconds){
        this.cache = new NodeCache({stdTTL: ttlSeconds, checkperiod: ttlSeconds*0.5, useClones:true});
    }

    getUser(user_id){
        const key = user_id.toString();
        return this.get(key,()=>
            new Promise((resolve, reject)=>{
                connectToDb().then(dbo=>{
                    dbo.collection("users").findOne({_id: ObjectId(user_id)}, {projection: {password:false, active:false, isAdmin:false}},(err,result)=>{
                        if(err) reject(err);
                        else{
                            resolve(result);
                        } 
                    })
                }).catch(err=>reject(err))
            })
        ).then(result=>{
            return result;
        }).catch(err=>{
            throw err;
        })
    }

    get(key, storeFunction){
        const value = this.cache.get(key);
        if(value){
            return Promise.resolve(value);
        }
        return storeFunction().then(result=>{
            this.cache.set(key, result);
            return result;
        });
    }
}

const Cache = new cache(300);

module.exports = Cache;