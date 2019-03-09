const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_I = 10;
const jwt = require('jsonwebtoken');



const userSchema = mongoose.Schema({

    email:{
        type:String,
        require: true,
        trim:true,
        unique:1

    },
    password: {
        type:String,
        require: true,
        minlength:6
    },
    token:{
        type: String
    }


});



userSchema.pre('save',function(next){
    var user = this;

    if(user.isModified('password')){

        bcrypt.genSalt(SALT_I,(err,salt) =>{
            if(err) return next(err);
     
            bcrypt.hash(user.password,salt,(err,hash) =>{
                 if(err) return next(err);
                 user.password = hash;
                 next();
            });
     
         });

    }else{
        next();
    } 

});

userSchema.methods.comparePassword = function(candidatepassword,cb){

    bcrypt.compare(candidatepassword,this.password, (err,isMatch) =>{
        if(err) throw cb(err);
        cb(null,isMatch);
       
    })

}

userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),'supersecret');

    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);

    })
};


userSchema.statics.findByToken = function(token,cb){
    const user = this;

    jwt.verify(token, 'supersecret',function(err,decode){
        user.findOne({"_id":decode,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })


}

 

const User = mongoose.model('user',userSchema);

module.exports = {User};