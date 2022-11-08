const Course = require('../models/course');
const {validationResult} = require('express-validator');


exports.addPage = (req,res) => {
    res.render('add', {
        title:'| Add Course',
        isAdd:true,
        error:req.flash('error')
    })
}


exports.addNewCourse = async (req,res) => {
    if(!req.body) return res.sendStatus(400);
    
    try{
        const {title,price,image,text} = req.body;
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(422).render('add', {
                title:'| Add Course',
                isAdd:true,
                error:errors.array()[0].msg,
                data:{
                    title, price,
                    image, text,
                }
            });
        }

        const course = await Course.create({
            title, price,
            image, text,
            userId:req.user
        })

        await req.user.addCourseToMyCourses(course._id);
        res.redirect('/myaccount');

    }catch(err){
        console.log(err);
    }
}