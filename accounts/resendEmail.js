const express = require('express');
const router = express.Router();
const { sendVerifyEmail } = require('./utils');
const findUser = require('./utils').findUser;

router.get('/',(req,res)=>{
    const query = req.query;
    findUser({username:query.username, email:query.username}).then(result=>{
        if(result){
            sendVerifyEmail(result.email, req.get('host'));
            res.json({
                success:true,
                message: 'Check your email'
            })
        }else{
            res.json({
                success:false,
                message: 'User not found'
            })
        }
    })
    
})

module.exports = router;