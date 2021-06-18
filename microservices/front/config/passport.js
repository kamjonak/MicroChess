const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email'},(email,password,done)=>{
            console.log("tutaj");
            if (email == "admin@admin.com" && password == "admin") {
                console.log("oro1");
                return done(null, true);
            }
            else {
                console.log("oro2");
                return done(null, false, {message: 'wrong'});
            }
            //match user
            // User.findOne({email:email})
            // .then((user)=>{
            //     if(!user){
            //         return done(null,false,{message:'email not registered'});
            //     }
            //     //math passwords
            //     bcrypt.compare(password,user.password,(err,isMatch)=>{
            //         if(err) throw err;
            //         if(isMatch){
            //             return done(null,user);
            //         } else{
            //             return done(null,false,{message: 'password incorrect'});
            //         }
            //     })
            // })
            // .catch((err)=>{console.log(err)})
        })
    )
    passport.serializeUser(function(user,done) {
        console.log("seriazlie");
        done(null,1);
    })
    passport.deserializeUser(function(id,done){
        console.log("deserialize");
        //done(err, user);
        done(null, 1);
    })
}