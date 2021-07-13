const Course = require('../models/course');
const User = require('../models/user');


function mapUserCourses(courses){
    return courses.map(course => ({
        ...course.courseId._doc
    }))
}


exports.accountPage = async (req, res) => {
	try{
        const user = await req.user
                .populate('courses.courseId')
                .execPopulate();
    
        const mycourses = mapUserCourses(user.courses);
        
        res.render('myAccount', {
            title:'| My Account',
            isAccount:true,
            success:req.flash('success'),
            mycourses
        })
    }catch(err){
        console.log(err);
    }
};


exports.removeMyCourse = async (req, res) => {
	try{
        await User.updateMany(
            {},
            {
                $pull:{
                    cart:{
                        courseId:req.params.id
                    }
                }
            }
        )

        const course = await Course.findByIdAndDelete(req.params.id);
        await req.user.removeMyCourse(course._id);

        res.send('Course is deleted');
        
    }catch(err){
        console.log(err);
    }
}


