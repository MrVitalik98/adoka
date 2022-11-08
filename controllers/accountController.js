const User = require('../models/user');

function mapCourses(arr){
	return arr.map(course => ({
		...course.courseId._doc
	}))
}


exports.createrCourse = async (req, res) => {
	try{
		if(req.user && req.params.id.toString() === req.user._id.toString()){
			return res.redirect('/myaccount');
		}
		const creater = await User.findById(req.params.id)	
							.populate('courses.courseId');

		const courses = mapCourses(creater.courses);
			
		res.render('account', {
			title: `| ${creater.firstname} ${creater.lastname}`,
			creater, courses
		})
	}catch(err){
		res.redirect('/courses')
	}
};