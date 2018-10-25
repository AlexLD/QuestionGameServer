
const connectToDb = require('../../accounts/mongodb');
const ObjectId = require('mongodb').ObjectId;

function loadGames(){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("games").find({}).toArray((err, result)=>{
                if(err) reject(err);
                else resolve(result);
            })
        }).catch(err=>{
            reject(err);
        })
    })
}

function updateGame(game, userId, date){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            if(game._id){ //update game
                dbo.collection("games").findOneAndUpdate({_id: ObjectId(game._id)}, {$set: {title: game.title, updated_at:date, updated_by:userId}}, (err,result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            }else{       //new game
                let record = {
                    title: game.title,
                    created_at: date,
                    created_by: userId,
                    updated_at: date,
                    updated_by: userId,
                }
                dbo.collection("games").insertOne(record, (err, result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            }
        }).catch(err=>{
            reject(err);
        })
    })
    
}

module.exports = {
    loadGames,
    updateGame,
}