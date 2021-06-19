const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
//login page
router.get('/', (req,res)=>{
    res.render('welcome');
})
//register page
router.get('/register', (req,res)=>{
    res.render('register');
})
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    console.log(req.session.passport.user);
    res.render('dashboard',{
        user: req.user
    });
})

router.get('/test',ensureAuthenticated,(req,res)=>{
    console.log(req.session.passport.user);
    res.render('index',{
        user: req.user
    });
})
module.exports = router; 