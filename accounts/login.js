const express = require('express');
const router = express.Router();
const passport = require('./passport-local');
const jwt = require('jsonwebtoken');

router.post('/',(req,res)=>{
    passport.authenticate('local',{session:false},(err,user,info)=>{
        if(user){
            if(user.active){
                jwt.sign({user:user.id}, process.env.JWT_SECRET, (err,token)=>{
                    res.json({
                        success:true,
                        user:user,
                        token,
                    });
                    res.end();
                })
            }else{
                res.json({
                    success:false,
                    verifyEmail:true,
                    message:'Your account is not activated'
                });
                res.end();
            }
        }else{
            res.json({
                success:false,
                message:info.message
            });
            res.end();
        }
    })(req,res);
})

module.exports = router;