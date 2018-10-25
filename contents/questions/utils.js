
const connectToDb = require('../../accounts/mongodb');
const ObjectId = require('mongodb').ObjectId;

function loadQuestions(game_id){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("questions").find({game_id: game_id}).toArray((err, result)=>{
                if(err) reject(err);
                else resolve(result);
            })
        }).catch(err=>{
            reject(err);
        })
    })
}

function updateQuestion(question, game_id, userId, date){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            if(question._id){ //update question
                dbo.collection("questions").findOneAndUpdate({_id: ObjectId(question._id)}, {$set: {content: question.content, updated_at:date, updated_by:userId}}, (err,result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            }else{       //new question
                let record = {
                    content: question.content,
                    game_id: game_id,
                    created_at: date,
                    created_by: userId,
                    updated_at: date,
                    updated_by: userId,
                }
                dbo.collection("questions").insertOne(record, (err, result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            }
        }).catch(err=>{
            reject(err);
        })
    })
}

function deleteQuestion(question_id){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("questions").deleteOne({_id: ObjectId(question_id)}, (err, result)=>{
                if(err) reject(err);
                else resolve(result);
            })
        }).catch(err=>{
            reject(err);
        })
    })
}

module.exports = {
    loadQuestions,
    updateQuestion,
    deleteQuestion,
}