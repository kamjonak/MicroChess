const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');


router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/register',(req,res)=>{
    res.render('register')
});

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect : '/',
        failureRedirect: '/users/login',
        failureFlash : 'Invalid username or password'
    })(req,res,next);
});

router.post('/register',(req,res)=>{
    const {name, password, password2} = req.body;
    let errors = [];

    if (name.length > 12)
        errors.push({msg : "Username too long (max 12 characters)"});

    if(!name || !password || !password2)
        errors.push({msg : "Please fill in all fields"})

    if(password !== password2)
        errors.push({msg : "passwords dont match"});

    if(errors.length > 0 ) {
        res.render('register', {errors : errors})
    } 
    else {
        axios
            .post('http://users:9000/register/', {
                name: name,
                password: password
            })
            .then(function (response) {
                if (response.data == 'ok')
                    res.redirect('/users/login');
                else
                    res.render('register', {errors: [{msg:'Username already in use'}]});
            })
            .catch(function (error) {
                console.log("error");
            }); 
    }
});

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','Now logged out');
    res.redirect('/users/login'); 
});

module.exports  = router;