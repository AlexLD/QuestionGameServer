const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport'); 
const app = express();

require('dotenv').config();

const gameServer = require('./gameplay/gameServer');
let game = new gameServer(app, true);

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

//login and signup
app.use('/Login',require('./accounts/login'));
app.use('/Signup',require('./accounts/signup'));
app.use('/Verify',require('./accounts/verify'));
app.use('/ResendEmail',require('./accounts/resendEmail'));

//game content
app.use('/Games',require('./contents/games/'));
//question content
app.use('/Questions',require('./contents/questions'));

//game play
app.use('/GamePlay',require('./gameplay'));

const port = process.env.PORT || '3000';
app.set('port',port);

app.listen(port,()=>{
    console.log("running on port "+port);
})