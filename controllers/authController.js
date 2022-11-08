const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const sendgrid = require('nodemailer-sendgrid-transport')
const { validationResult } = require('express-validator');
const registration = require('../mailer/registration');
const resetEmail = require('../mailer/reset');


const transporter = nodemailer.createTransport(
    {
        host:'smtp.mail.ru',
        port: 465,
        secure:true,  // 465 - true, for another keys - false
        auth:{
            user:process.env.FROM_EMAIL,
            pass:process.env.FROM_EMAIL_PASSWORD
        }
    },
    {
        from:process.env.FROM_EMAIL
    }
);


// const transporter = nodemailer.createTransport(
//     sendgrid({
//         auth: { api_key: process.env.SENDGRID_API_KEY }
//     })
// )


exports.registerPage = (req,res) => {
    res.render('auth/register', {
        title:'| Register',
        error:req.flash('error')
    })
};


exports.resetPage = (req,res) => {
    res.render('auth/reset', {
        title:'| Are you forget password?',
        error:req.flash('error')
    })
};


exports.newPasswordPage = async (req, res) =>{
    if(!req.params.token){
        return res.redirect('/');
    }

    try{
        const user = await User.findOne(
            {
                resetToken:req.params.token,
                resetTokenExp: {$gt: Date.now()}
            }
        )

        if(user){
            res.render('auth/password', {
                title:'| Create New Password',
                error:req.flash('error'),
                userId:user._id.toString(),
                token:req.params.token
            })
        }
        else{
            req.flash('error', 'token expired');
            res.redirect('/');
        }

    }catch(err){
        console.log(err);
    }    
};


exports.loginAccount = async (req,res) => {
    try{
        const {email,pass} = req.body;
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect('/');
        }

        const user = await User.findOne({ email });
        
        if(user){ 
            const password = await bcryptjs.compare(pass, user.password);
            
            if(password){
                req.session.isAuthenticated = true;
                req.session.user = user;
                req.session.save(err => {
                    if(err){
                        throw err;
                    }
                    
                    res.redirect('/myaccount');  
                })
            }else{
                req.flash('error', 'Email or password is wrong');
                res.redirect('/');
            }
        }else{
            req.flash('error', 'Not such user exists');
            res.redirect('/');
        }

    }catch(err){
        console.log(err);
    }
};


exports.registerNewAccount = async (req,res) => {
    try{
        const {frname,lsname,email,pass} = req.body;
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            req.flash('error', errors.array()[0].msg);
            return res.status(422).render('auth/register', {
                title:'| Register',
                error:req.flash('error'),
                data:{
                    firstname:frname,
                    lastname:lsname,
                    email
                }
            });
        }

        const password = await bcryptjs.hash(pass, 10);

        await User.create({
            firstname: frname,
            lastname: lsname,
            email, password,
            avatarURL: ''
        })

        req.flash('success', 'Registration completed successfully');
        res.redirect('/');
        await transporter.sendMail(registration(email,frname))
    }catch(err){
        console.log(err);
    }
};


exports.resetToEmail = (req,res) => {
    if(!req.body) return res.sendStatus(400);

    try{
        crypto.randomBytes(32, async (err, buffer) => {
            if(err){
                req.flash('error', 'Something went wrong, please try again later');
                return res.redirect('/');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({email:req.body.email});

            if(!candidate){
                req.flash('error','Not such email exists');
                return res.redirect('/auth/reset');
            }

            candidate.resetToken = token;
            candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
            await candidate.save();
            
            req.flash('success', `The letter was sent to the email.`);
            res.redirect('/');     
            await transporter.sendMail(resetEmail(candidate.email, candidate.firstname, token))       
        })
    }catch(err){
        console.log(err)
    }
};


exports.newPassword = async (req,res) => {
    if(!req.body) return res.sendStatus(400);
    
    try{
        const user = await User.findOne(
            {
                _id:req.body.userId,
                resetToken:req.body.token,
                resetTokenExp: {$gt: Date.now()}
            }
        )

        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect(`/auth/password/${user.resetToken}`);
        }

        if(user){
            user.password = await bcryptjs.hash(req.body.pass, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();

            req.flash('success', 'Password changed successfully');
            return res.redirect('/');
        }

        req.flash('error', 'Token expired');
        res.redirect('/');

    }catch(err){
        console.log(err)
    }
};

exports.logoutFromAccount = (req,res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
};
