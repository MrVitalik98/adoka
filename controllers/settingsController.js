const aws = require('aws-sdk');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Course = require('../models/course');
const Chat = require('../models/chat');
const { validationResult } = require('express-validator');


const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})


function filterAndDeleteChatrooms(userChats, userId){
    let chats = userChats.map(ch => ({
        id: ch.chatroomId._doc._id,
        users: ch.chatroomId._doc.users
    }))

    chats.forEach(async ch => {
        let p = ch.users.find(u => u.user.toString() !== userId.toString());
        let user = await User.findById(p.user);
        if(!user){
            await Chat.findByIdAndDelete(ch.id);
        }
    });
    
}


exports.settingsPage = async (req, res) => {
    const user = await User.findById(req.user._id);
    
    res.render('settings',{
        title:'/Settings',
        isSetting:true,
        error:req.flash('error'),
        user
    })
};


exports.changeAvatar = async (req, res) => {
	try{
        const user = await User.findById(req.user._id);
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect('/settings');
        }

        const avatar = user.avatarURL;
        
        if(avatar){
            const img = avatar.split('/')[3];

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: img
            }

            await s3.deleteObject(params, (error, data) => {
                if(error){
                    throw error;
                }
                else{
                    console.log(data);
                }
            })
        }

        const imageType = req.file.mimetype.split('/');

        const params = {
            Key: `${uuid.v4()}.${imageType[1]}`,
            Bucket: process.env.S3_BUCKET_NAME,
            Body: req.file.buffer
        }
        

        await s3.upload(params, async (error, data) => {
            if(error){
                throw error;
            }else{
                user.avatarURL = data.Location;
                await user.save();
            }
        })
                
        res.status(200).redirect('/myaccount');
    }catch(err){
        console.log(err);
    }
};


exports.removeAvatar = async (req, res) => {
	try{
        const user = await User.findById(req.params.id);    

        const avatar = user.avatarURL;
        
        if(avatar){
            const img = avatar.split('/')[3];

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: img
            }

            await s3.deleteObject(params, (error, data) => {
                if(error){
                    throw error;
                }
                else{
                    console.log(data);
                }
            })
        }

        user.avatarURL = '';
        
        await user.save();
        res.redirect('/myaccount');
    }catch(err){
        console.log(err);
    }
}


exports.changeName = async (req, res) => {
	try{
        const {frname,lsname} = req.body;
        const user = await User.findById(req.user._id);
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect('/settings');
        }
        
        user.firstname = frname;
        user.lastname = lsname;

        await user.save();        
        res.redirect('/myaccount');

    }catch(err){
        console.log(err);
    }
}


exports.changePassword = async (req, res) => {
	if(!req.body) return res.sendStatus(400);

    try{
        const {newpass} = req.body;
        const user = await User.findById(req.user._id);
        
        const errors = validationResult(req);
    
        if(!errors.isEmpty()){
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect('/settings');
        }
        
        const newpassword = await bcrypt.hash(newpass, 10);
        user.password = newpassword;

        await user.save();

        req.flash('success', 'Password changed successfully');
        res.redirect('/myaccount');

    }catch(err){
        console.log(err);
    }
}


exports.removeAccount = async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.user._id)
                                .populate('chats.chatroomId');

        filterAndDeleteChatrooms(user.chats, user._id);

        const cart = user.courses.map(c => {
            return c.courseId 
        });

        
        await User.updateMany(
            {},
            {
                $pull:{
                    cart:{
                        courseId:{
                            $in:[...cart]
                        }
                    }
                }
            }
        );

        const avatar = user.avatarURL;
        
        if(avatar){
            const img = avatar.split('/')[3];

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: img
            }

            await s3.deleteObject(params, (error, data) => {
                if(error){
                    throw error;
                }
                else{
                    console.log(data);
                }
            })
        }

        await Course.deleteMany({userId:req.user._id});
        
        req.session.destroy(() => {
            res.redirect('/');
        })

    }catch(err){
        console.log(err)
    }
}
