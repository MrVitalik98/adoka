const User = require('../models/user');
const Course = require('../models/course');
const { validationResult } = require('express-validator');


function isOwner(course,req){
    return course.userId.toString() == req.user._id.toString();
};


exports.editPage = async (req,res) => {
    try{
        const course = await Course.findById(req.params.id);

        if(isOwner(course,req)){
            res.render('edit',{
                title:`| Edit ${course.title} course`,
                course, 
                error:req.flash('error')
            })
        }else{
            res.redirect('/myaccount');
        }

    }catch(err){
        res.redirect('/myaccount')
    }
};


exports.editCourse = async (req,res) => {
    try{
        if(req.query.edit){
            const {title,price,image,text} = req.body;
            const course = await Course.findById(req.params.id);

            const errors = validationResult(req);
            
            if(!errors.isEmpty()){
                req.flash('error', errors.array()[0].msg);
                return res.status(422).redirect(`/edit/${req.params.id}`);
            }
            
            if(isOwner(course,req)){
                await Course.findByIdAndUpdate( req.params.id,
                    {
                        $set:{
                            title,price,
                            image,text
                        }
                    }
                )
                
                res.redirect('/myaccount');

            }else{
                res.redirect('/myaccount');
            }
        }else{
            res.redirect('/myaccount');
        }
    }catch(err){
        console.log(err);
    }
}