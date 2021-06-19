const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: "name"}, (name,password,done)=>{
            console.log("tutaj");
            // if (email == "admin@admin.com" && password == "admin") {
            //     console.log("oro1");
            //     return done(null, "admin");
            // }
            // else if (email == "admin2@admin.com" && password == "admin") {
            //     return done(null, "admin2");
            // }
            // else {
            //     console.log("oro2");
            //     return done(null, false, {message: 'wrong'});
            // }

            axios
                .post('http://users:9000/login/', {
                    name: name,
                    password: password
                })
                .then(function (response) {
                    console.log(response.data);
                    if(response.data.name != 'error')
                        return done(null, response.data);
                    else
                        return done(null, false, {message: 'wrong name or password'});
                })
                .catch(function (error) {
                    console.log("error");
                }); 



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
        console.log(user);

        done(null,user.name);
    })
    passport.deserializeUser(function(name,done){
        console.log("deserialize");
        //done(err, user);
        return done(null, name);

        // axios
        //     .post('http://users:9000/getUserById/', {
        //         name: name
        //     })
        //     .then(function (response) {
        //         console.log(response.data);
        //         return done(null, response.data);
        //     })
        //     .catch(function (error) {
        //         console.log("error");
        //     });    
    })
}