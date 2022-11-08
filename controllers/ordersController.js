const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order');
const paypal = require('paypal-rest-sdk');
const user = require('../models/user');


paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
})


function mapCart(cart){
    return cart.map(c => ({
        count:c.count,
        ...c.courseId._doc
    }))
}


function mapOrders(arg){
    return arg.map(c => {
        let courses = c.order.courses.map(course => ({
            ...course,
            orderId: c.order._id
        }));
        
        return {
            _id: c._id,
            courses,
            price: c.order.price,
            date: c.order.date
        }
    })
}


function stripeItems(courses){
    return courses.map(c => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: `Course ${c.title}`,
                images: [c.image],
                description: `Adoka Courses`,
            },
            unit_amount: c.price * 100
        },
        quantity: c.count
    }))
}


function paypalItems(courses){
    return courses.map(c => ({
        "name": c.title,
        "sku": "item",
        "price": c.price,
        "currency": "USD",
        "quantity": c.count
    }))
}


// User Orders

exports.userOrders = async (req,res) => {
    try{
        const userOrders = await req.user
                            .populate('orders.order')
                            .execPopulate();

        const orders = mapOrders(userOrders.orders);
        
        res.render('orders', {
            title:'/Orders',
            isOrder: true,
            orders
        });
        
    }catch(err){
        console.log(err);
    }
};


//  Payment with Stripe

exports.makeInOrder = async (req,res) => {
    try{
        const user = await req.user    
            .populate('cart.courseId')
            .execPopulate();

        const cart = mapCart(user.cart)
        
        const session = await stripe.checkout.sessions.create({
            customer_email: req.user.email,
            payment_method_types: ['card'],
            payment_intent_data:{
                description: `Hello ${req.user.firstname}`,
                receipt_email: req.user.email,
                statement_descriptor: 'Succeded payment'
            },
            line_items: stripeItems(cart),
            locale: 'en',
            mode: "payment",
            success_url: `${process.env.BASE_URL}/orders/added_order`,
            cancel_url: `${process.env.BASE_URL}/cart`,
        })
        
        res.json({id: session.id})        
    }catch(err){
        console.log(err);
    }
};



//  Open Course 

exports.openCourse = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        const { courseId } = req.query;
        const courses = order.courses;
        const course = courses.find(c => c._id.toString() === courseId.toString());

        res.render('order', {
            title: `| Course ${course.title}`,
            course
        })
    }catch(err){
        res.redirect('/orders')
    }
}


//  Add New Order

exports.addNewOrderToUserOrders = async (req, res) => {
    const user = await req.user    
            .populate('cart.courseId')
            .execPopulate();
    
    const cart = mapCart(user.cart);
    const price = cart.reduce((total, course) => {
        return total += course.count * course.price;
    }, 0)

    const newOrder = await Order.create({
        userId: req.user._id,
        courses: cart,
        price
    })

    await req.user.makeInOrder(newOrder._id);
    await req.user.cleanCart();
    res.redirect('/orders');
}


// Remove Order

exports.removeOrder = async (req,res) => {
    try{
        await req.user.removeOrder(req.params.id);
        res.send('Order is deleted');
    }catch(err){
        console.log(err);
    }
};


// Payment With PayPal

exports.paymentWithPaypal = async (req, res) => {

    const user = await req.user    
            .populate('cart.courseId')
            .execPopulate();

    const cart = mapCart(user.cart);
    const total = cart.reduce((sub, course) => sub + course.price * course.count, 0)

    const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `http://${process.env.BASE_URL}/orders/added_order`,
        "cancel_url": `http://${process.env.BASE_URL}/cart`
    },
    "transactions": [{
        "item_list": {
            "items": paypalItems(cart)
        },
        "amount": {
            "currency": "USD",
            "total": total
        },
        "description": "Courses Adoka"
    }]
};



    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0; i < payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href)
                }
            }
        }
    });
}

