const express = require('express');
const router = express.Router();
const connectToDb = require('./mongodb');

router.get('/',(req,res)=>{
    const query = req.query;
    verifyEmail(query.email, query.secret).then(result=>{
        res.send(result.message);
    }).catch(err=>{
        res.sendStatus(500);
    })
})

function verifyEmail(email, secret){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("emailVerify").findOne({email:email},(err,result)=>{
                if(err){
                    reject(err);
                }else if(!result){
                    resolve({
                        success: false,
                        message: 'Wrong email, or email had already been verified',
                    });
                }else{
                    if(secret !== result.secret){
                        resolve({
                            success: false,
                            message: 'Link expired.'
                        });
                        return;
                    }
                    dbo.collection("users").findOneAndUpdate({email:email}, {$set: {active:true}}, (err,result)=>{
                        if(err){
                            reject(err);
                        }else if(!result.value){
                            resolve({
                                success:false,
                                message: 'Email not registered.'
                            });
                        }else{
                            dbo.collection("emailVerify").deleteOne({email: email});
                            resolve({
                                success:true,
                                message:'Email verified'
                            })
                        }
                    })
                }
            })
        }).catch(err=>{
            reject(err);
        })
    })
}

module.exports = router;