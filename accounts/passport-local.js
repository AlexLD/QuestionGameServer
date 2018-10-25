const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const findUser = require('./utils').findUser;

passport.use(new localStrategy(
    function(username, password, done){
        findUser({username:username, email:username, password:password})
        .then(result=>{
            if(result){
                bcryptjs.compare(password, result.password, (err,same)=>{
                    if(same){
                        const user = {
                            id:result._id,
                            username: result.username,
                            email: result.email,
                            active: result.active,
                        }
                        return done(null, user);
                    }else{
                        return done(null, false, {message:"Incorrect Password"});
                    }
                })
            }else{
                return done(null,false,{message:'User Does Not Exist'});
            }
        })
        .catch(err=>{
            console.log(err);
        })
    }
));

  /**
  * Middleware used by APIs across the application
  */
 function jwtMiddleware(req,res,next){
    const tokenHeader = req.headers['authorization'];
    if(typeof tokenHeader !== 'undefined'){
        req.token = tokenHeader.split(' ')[1];
        next();
    }else{
        res.sendStatus(403); //forbidden
    }
 }

 module.exports = passport;
 module.exports.jwtMiddleware = jwtMiddleware;