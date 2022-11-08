const Course = require('../models/course');


exports.allCourses = async (req,res) => {
    try{
        const courses = await Course.find()
                .populate('userId');


        const allcourses = courses.map(c => ({
                course: c,
                user: {...c.userId._doc}
        }))
          

        res.render('courses',{
            isCourses:true,
            title:'| All Courses',
            allcourses: allcourses.slice(0,5),
            count: allcourses.length,
        })

    }catch(err){
        console.log(err);
    }
};


exports.course = async (req,res) => {
    try{
        const course = await Course.findById(req.params.id);

        res.render('course',{
            title:`| Course ${course.title}`,
            course
        })
    }catch(err){
        res.redirect('/courses')
    }
    
};


exports.findCourses = async (req,res) => {
    if(req.body.search.trim()){
        const courses = await Course.find(
            {
                $text:{
                    $search:req.body.search
                }
            },
            {
                score:{
                    $meta:'textScore'
                }
            }
        )
        .sort(
            {
                score:{
                    $meta:'textScore'
                }
            }
        ).populate('userId');
        
        const allcourses = courses.map(c => {
            return {
                course:c,
                user:{...c.userId._doc}
            }
        })

        res.render('courses',{
            title:'| All Courses',
            isCourses:true,
            allcourses: allcourses.slice(0, 5),
            count: courses.length,
            searchCourseName: req.body.search.trim()
        })
    }
    else{
        res.redirect('/courses');
    }    
};


exports.coursesPage = async (req, res) => {
    const { number, search } = req.query;
    
    try{
        let courses, searchCourseName;

        if(!search){
            searchCourseName = '';
            courses = await Course.find().limit(5)
                .skip((+number - 1) * 5).populate('userId');
        }else{
            searchCourseName = search;
            courses = await Course.find(
                {
                    $text: {
                        $search: search
                    }
                },
                {
                    score:{
                        $meta: 'textScore'
                    }
                }
            )
            .sort({
                score: {
                    $meta: 'textScore'
                }
            })
            .limit(5).skip((+number - 1) * 5).populate('userId');
        }

        const allcourses = courses.map(c => ({
                course: c,
                user: {...c.userId._doc}
        }))
        
        res.json({allcourses, searchCourseName});

    }catch(err){
        console.log(err);
    }
}