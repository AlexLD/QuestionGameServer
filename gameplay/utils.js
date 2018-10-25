const connectToDb = require('../accounts/mongodb');
const ObjectId = require('mongodb').ObjectId;
const cache = require('../cache/cache');

function createGameSession(game_id, user_id, date){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            let session = newSessionId();
            let record = {
                game_session: session,
                game_id: game_id,
                created_at: date,
                created_by: user_id,
                status: "created"
            }
            dbo.collection("gameSessions").insertOne(record, (err, result)=>{
                if(err) reject(err);
                else resolve(session);
            })
        }).catch(err=>{
            reject(err);
        })
    })
}

function startGameSession(game_session){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("gameSessions").updateOne({game_session: game_session}, {$set: {status: "started"}},  (err, result)=>{
                if(err) reject(err);
                else resolve(result);
            })
        }).catch(err=>{
            reject(err);
        })
    })
}

function joinGameSession(game_session, user_id, date){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("gameSessions").findOne({game_session: game_session}).then(result=>{
                return result;
            }).then(result=>{
                if(result){
                    let record = {
                        player_id: user_id,
                        game_session: game_session,
                        joined_at: date,
                    }
                    return dbo.collection("playersInSession").insertOne(record);
                }else{
                    return Promise.reject();
                }
            }).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
        })
        .catch(err=>{
            reject(err);
        })
    })
}

//load user's current game sessions, either the one they created, or have joined
function loadGameSession(user_id){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            getMyGameSession(dbo, user_id).then(result=>{
                let gameSession = result.gameSession;
                let players = result.players;
                if(gameSession){   //if there's a game user has created it, return it
                    isPlaying(dbo, user_id, gameSession.game_session).then(result=>{
                        let joined = result!=null;
                        resolve({
                            ...gameSession,    //game session user has created
                            joined: joined,    //whether user has joined this session
                            isCreatorOfGame: true,
                            players: players,
                        })
                    })
                }else{
                    gamePlaying(dbo, user_id).then(result=>{
                        let gameSession = result.gameSession;
                        let players = result.players;
                        if(gameSession){      //if user has currently joined a game, return it
                            resolve({
                                ...gameSession,
                                joined: true,
                                isCreatorOfGame: false,
                                players: players,
                            })
                        }else{
                            reject(result);
                        }
                    })
                }
            })
        })
    })
}

//load game user_id created
async function getMyGameSession(dbo, user_id){
    let result = {};
    let session = await dbo.collection("gameSessions").findOne({
        $and: [
            {created_by: user_id}, 
            {$or: [
                {status: "created"},
                {status: "started"}
            ]}
        ]
    });
    if(session){
        result.gameSession = session;
        let players = await dbo.collection("playersInSession").find({game_session: session.game_session}).toArray();
        playersObj = await createPlayersObj(players);
        result.players = playersObj;
    }
    return result;
}

async function createPlayersObj(players){
    let result = {};
    await players.forEach(async p =>{
        let user = await cache.getUser(p.player_id);
        result[p.player_id] = user.username;
    })
    return result;
}

async function getPlayersWithName(players){
    return Promise.all(players.map(async p =>{
        let user = await cache.getUser(p.player_id);
        let username = user.username;
        p.name = username;
        return p;
    }))
}
/**
 * load game user has joined
 * @param {*} dbo 
 * @param {*} user_id 
 */
async function gamePlaying(dbo, user_id){
    let result = {};
    let game = await dbo.collection("playersInSession").findOne({player_id:user_id});
    if(game){
        result.game = game;
        let session = await dbo.collection("gameSessions").findOne({game_session: game.game_session});
        result.gameSession = session;

        let players = await dbo.collection("playersInSession").find({game_session: game.game_session}).toArray();
        playersObj = await createPlayersObj(players);
        result.players = playersObj;
    }
    return result;
}

/**
 * return whether player has joined the game session
 * @param dbo 
 * @param user_id 
 * @param game_session 
 */
async function isPlaying(dbo, user_id, game_session){
    let val = await dbo.collection("playersInSession").findOne({player_id:user_id, game_session: game_session});
    return val;
}

function newSessionId(){
    return Math.random().toString(36).substring(5);
}

module.exports = {
    createGameSession,
    loadGameSession,
    startGameSession,
    joinGameSession
}