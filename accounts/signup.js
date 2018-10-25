const express = require('express');
const router = express.Router();
const connectToDb = require('./mongodb');
const bcryptjs = require('bcryptjs');
const findUser = require('./utils').findUser;
const sendVerifyEmail = require('./utils').sendVerifyEmail;
const saltRounds = 10;

router.post('/',(req,res)=>{
    const user = req.body;
              
    registerUser(user, req.get('host')).then(result=>{
        res.json({
            success:true,
        })
        res.end();
    }).catch(err=>{
        res.json({
            success:false,
            message: err.message,
        })
        res.end();
    })
})

/**
 * checks whether user name or email is already used, if not, hashes password and stores everything in database
 * @param user user object containing userName, email and password
 */
function registerUser(user, host){
    return new Promise((resolve,reject)=>{
        findUser({username:user.userName, email:user.email}).then(results=>{
            if(results){
                reject({
                    message: 'User name or email already taken'
                });
            }else{
                connectToDb().then(dbo=>{
                    bcryptjs.hash(user.password,saltRounds,(err,hash)=>{
                        const newUser = {
                            username: user.userName,
                            email: user.email,
                            password: hash,
                            active: false,
                            isAdmin: false,
                        }
                        dbo.collection("users").insertOne(newUser,(err,result)=>{
                            if(err) reject(err);
                            else resolve(result);
                        })
                    });
                    sendVerifyEmail(user.email, host);
                }).catch(err=>reject(err));
            }
        })
        
    })
}

module.exports = router;