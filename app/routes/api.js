var User = require('../models/user');
var config = require('../../config.js');
var jsonwebtoken = require('jsonwebtoken');

var secretKey = config.secretKey;

function createToken(user){
    var token = jsonwebtoken.sign({
        _id: user._id,
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

            res.json(users);

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


    return api;

}