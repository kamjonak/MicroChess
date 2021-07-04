const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
//login handle
router.get('/login',(req,res)=>{
    res.render('login');
})
router.get('/register',(req,res)=>{
    res.render('register')
    })
//Register handle
router.post('/login',(req,res,next)=>{
    console.log("router post");
    passport.authenticate('local',{
        successRedirect : '/',
        failureRedirect: '/users/login',
        failureFlash : true
    })(req,res,next);
    console.log("after authenticate");
})
  //register post handle
router.post('/register',(req,res)=>{
    const {name, password, password2} = req.body;
    let errors = [];
    console.log(' Name ' + name+ ' pass:' + password);

    if (name.length > 12)
        errors.push({msg : "Username too long (max 12 characters)"});
    if(!name || !password || !password2) {
        errors.push({msg : "Please fill in all fields"})
    }
    //check if match
    if(password !== password2) {
        errors.push({msg : "passwords dont match"});
    }

    //check if password is more than 6 characters
    if(errors.length > 0 ) {
        res.render('register', {
        errors : errors,
        name : name,
        password : password,
        password2 : password2})
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
                    req.flash('error_msg','WRONG');
            })
            .catch(function (error) {
                console.log("error");
            }); 
        console.log("USER REGISTERED");
    }
})
//logout
router.get('/logout',(req,res)=>{
req.logout();
req.flash('success_msg','Now logged out');
res.redirect('/users/login'); 
})
module.exports  = router;