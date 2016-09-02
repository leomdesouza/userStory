var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    Username: { type: String, required: true, index: { unique:true }},
    password: { type: String, required: true, select: false }
});

User.Schema.pre('save', function(next){

    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err){
            return next();
        }

        user.password = hash;

        next();

    });

});

module.exports = mongoose.model('User', UserSchema);