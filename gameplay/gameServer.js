const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const jwtAuth = require('socketio-jwt-auth');
const cache = require('../cache/cache');

class gameServer {
    constructor(app, start){
        this.createApp(app);
        this.config();
        this.createServer();
        this.sockets();
        if(start){
            this.listen();
        }
    }

    createApp(app){
        this.app = app?app:express();
    }

    createServer(){
        this.server = http.createServer(this.app);
    }

    config(){
        this.port = 8080;
    }

    sockets(){
        this.io = socketIo(this.server);
        this.io.use(jwtAuth.authenticate({
            secret: process.env.JWT_SECRET,
            algorithm: 'HS256'
        }, (payload, done)=>{
            return done(null, payload.user);
        }))
    }

    listen(){
        this.server.listen(this.port, ()=>{
            console.log('running game server on port ' + this.port);
        })
        this.io.on('connect',(socket)=>{
            console.log('connected client on port ' + this.port + ' from user ' + socket.request.user);

            socket.on('message',(m)=>{
                console.log('[server] message: '+JSON.stringify(m));
                
            });
            socket.on('disconnect',()=>{
                console.log('client disconnected');
            });

            socket.on('JoinGame',(game)=>{
                socket.join(game);
                console.log(`User "${socket.request.user}" joins game "${game}"`);
                cache.getUser(socket.request.user).then(user=>{
                    this.io.to(game).emit('JoinGame', user._id, user.username);
                })
                
            })
        })
    }

    getApp(){
        return this.app;
    }
}

module.exports = gameServer;