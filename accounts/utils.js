const nodemailer = require('nodemailer');
const connectToDb = require('./mongodb');

let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
});

function sendVerifyEmail(email, host){
    let secret = Math.random().toString(36).substring(2); //random string
    let link = `http://${host}/verify?email=${email}&secret=${secret}`;
    
    let mailOptions = {
        from: 'sfcc.game.signup@gmail.com',
        to: email,
        subject: 'Please confirm your email account',
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>",
    } 
    transporter.sendMail(mailOptions, (err,info)=>{
        if(err){
            console.log(err);
        }else{
            console.log("email sent: "+info.response);
        }
    });

    connectToDb().then(dbo=>{
        dbo.collection("emailVerify").replaceOne({email:email},{email:email, secret:secret},{upsert:true});
    });
}

/**
 * Looks for user with 'user' as username or email from database
 * @param user username or email
 */
function findUser(user){
    return new Promise((resolve,reject)=>{
        connectToDb().then(dbo=>{
            dbo.collection("users").findOne({$or: [{username:user.username},{email:user.email}]},(err,result)=>{
                if(err) reject(err);
                else resolve(result);
            })
        }).catch(err=>{
            reject(err);
        })
    })
 }

module.exports = {
    sendVerifyEmail,
    findUser,
}