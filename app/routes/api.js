'use strict';

var User = require('../models/user.js');
var Story = require('../models/story.js')
var config = require('../../config.js');
var jsonwebtoken = require('jsonwebtoken');

var secretKey = config.secretKey;

function createToken(user){
    var token = jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username
    }, secretKey, {
        expiresIn: '24h'
    });

    return token;

}

module.exports = function(app, express){

    var api = express.Router();

    api.post('/signup',function(req,res){

        var user = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        });

        user.save(function(err){
            if(err){
                res.send(err);
                return;
            }

            res.json({ message: 'User has been created!' });

        });
    });

    api.get('/users',function(req,res){

        User.find({}, function(err, users){
            if(err){
                res.send(err);
                return;
            }
            else{
                res.json(users);
            }
        });
    });

    api.post('/login', function(req, res){
        User.findOne({ 
            username: req.body.username
         }, 'password', function(err, user){
             
             if(err) throw err;

             if(!user){
                 res.json({ message: "User doenst exist" });
             }
             else if(user){
                 var validPassword = user.comparePassword(req.body.password);

                 if(!validPassword){
                     res.json({ message: "Invalid Password" });
                 }
                 else{
                     var token = createToken(user);
                     res.json({
                         success: true,
                         message: "Sucessfuly login!",
                         token: token
                     });
                 }
             }
         });  
    });

    api.use(function(req, res, next){

        console.log("Somebody just came to our app!");

        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        // Check if token exist
        if(token){
            jsonwebtoken.verify(token, secretKey, function(err, decoded){
                if(err){
                    res.status(403).send({ sucess: false, message: "Failed to authenticate user" });
                }
                else{
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else{
            res.status(403).send({ success: false, message: "No token provided" });
        }
    });

    api.route('/')
        .post(function(req, res){

            var story = new Story({
                creator: req.decoded.id,
                content: req.body.content
            });
            story.save(function(err){
                if(err){
                    res.send(err);
                    return;
                }
                else{
                    res.json({ message: "New Story Created!" });
                }
            });
        })
        .get(function(req, res){

            Story.find({ creator: req.decoded.id }, function(err, stories){
                if(err){
                    res.send(err);
                    return;
                }
                else{
                    res.json(stories);
                }
            });
        }); 

    return api;

}