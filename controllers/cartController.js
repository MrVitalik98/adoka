const User = require('../models/user');


function mapCartCourses(cart){
    return cart.map(c => {
        return {
            count:c.count,
            ...c.courseId._doc
        }
    })
}


exports.userCart = async (req,res) => {
    try{
        const user = await req.user
                .populate('cart.courseId')
                .execPopulate();
    
        const cart = mapCartCourses(user.cart);

        const price = cart.reduce((total,course) => {
            return total + course.count * course.price;
        },0)

        res.render('cart', {
            title:'| Cart',
            isCart:true,
            cart,price
        })
    }catch(err){
        console.log(err);
    }
};


exports.addToCart = async (req,res) => {
    await req.user.addToCart(req.params.id);
    res.send('Course added to cart');
};


exports.increaseTheAmount = async (req,res) => {
    try{
        await req.user.increaseTheAmount(req.params.id);
        
        const user = await req.user
                    .populate('cart.courseId')
                    .execPopulate();
        
        res.json(user.cart);

    }catch(err){
        console.log(err);
    }
};


exports.removeCourseFromCart = async (req,res) => {
    try{
        await req.user.removeCourseFromCart(req.params.id);
       
        const user = await req.user 
                    .populate('cart.courseId')
                    .execPopulate();

        res.send(user.cart);

    }catch(err){
        console.log(err);
    }
};