const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: "name"}, (name,password,done)=>{
            axios
                .post('http://users:9000/login/', {
                    name: name,
                    password: password
                })
                .then(function (response) {
                    if(response.data.name != 'error')
                        return done(null, response.data);
                    else
                        return done(null, false, {message: 'wrong name or password'});
                })
                .catch(function (error) {
                    console.log("error");
                }); 
        })
    )
    passport.serializeUser(function(user,done) {
        done(null,user.name);
    })
    passport.deserializeUser(function(name,done){
        return done(null, name); 
    })
}