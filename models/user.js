const {Schema,model} = require('mongoose');
const Order = require('./order');

let userSchema = new Schema({
    firstname:{
        type:String,
        required:true
    },

    lastname:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    courses:[
        {
            courseId:{
                type:Schema.Types.ObjectId,
                ref:'Course',
                required:true
            }
        }
    ],

    cart:[
        {
            count:{
                type:Number,
                default:1
            },
            courseId:{
                type:Schema.Types.ObjectId,
                ref:'Course',
                required:true
            }
        }
    ],

    orders: [
        {
            order: {
                type: Schema.Types.ObjectId,
                ref: 'Order',
                required: true
            }
        }
    ],

    chats: [
        {
            chatroomId:{
                type: Schema.Types.ObjectId,
                ref: 'Chat',
                required: true
            }
        }
    ],

    avatarURL:String,
    resetToken: String,
    resetTokenExp: Date
},
    {
        versionKey: false
    }
)


// addCourseToMyCourses

userSchema.methods.addCourseToMyCourses = function(_id){
    let courses = [...this.courses];
    courses.push({
        courseId: _id
    });

    this.courses = courses;
    return this.save();
}


// removeMyCourse 

userSchema.methods.removeMyCourse = function(_id){
    let courses = [...this.courses];
    let cart = [...this.cart];

    let index = courses.findIndex(c => {
        return c.courseId.toString() == _id;
    });

    let idx = cart.findIndex(c => {
        return c.courseId.toString() == _id;
    })

    if(idx > -1){
        cart.splice(idx, 1);
    }

    if(index > -1 ){
        courses.splice(index,1);
    }

    this.courses = courses;
    this.cart = cart;
    
    return this.save();
}


// addToCart

userSchema.methods.addToCart = function(_id){
    let cart = [...this.cart];
    let index = cart.findIndex( c => {
        return c.courseId.toString() == _id;
    })

    if(index > -1 ){
        let count = cart[index].count;
        cart[index].count = ++count;
    }
    else{
        cart.push(
            {
                count:1,
                courseId:_id
            }
        )
    }

    this.cart = cart;
    return this.save();
}


// increase the amount

userSchema.methods.increaseTheAmount = function(_id){
    let cart = [...this.cart];
    let index = cart.findIndex(c => {
        return c.courseId.toString() === _id;
    })

    let count = cart[index].count;
    cart[index].count = ++count;

    this.cart = cart;
    return this.save();
}


// removeCourseFromCart

userSchema.methods.removeCourseFromCart = function(_id) {
    let cart = [...this.cart];
    let index = cart.findIndex(c => {
        return c.courseId.toString() === _id;
    })

    let count = cart[index].count;
    if(count == 1){
        cart.splice(index, 1);
    }else{
        cart[index].count = --count;
    }

    this.cart = cart;
    return this.save();
}


// makeInOrder

userSchema.methods.makeInOrder = function(orderId){
    let orders = [...this.orders];

    orders.push({
        order: orderId
    })

    this.orders = orders;
    return this.save()
}


// remove Order

userSchema.methods.removeOrder = async function(orderId){
    let orders = [...this.orders];
    let orderIndex = orders.findIndex(o => o._id.toString() === orderId.toString());
    
    if(orderIndex > -1){
        await Order.findByIdAndDelete(orders[orderIndex].order);
        orders.splice(orderIndex, 1);
    }

    this.orders = orders;
    return this.save()
}


// clean Cart

userSchema.methods.cleanCart = function(){
    this.cart = [];
    return this.save()
}


// Add new ChatRoom

userSchema.methods.addChatRoom = function(id){
    let chats = [...this.chats];

    chats.push({chatroomId: id});
    this.chats = chats;
    return this.save();
}


// Find Chat

userSchema.methods.findChat = function(id){
    let chats = [...this.chats];

    if(chats.length){
        let chatroom = chats.find(ch => ch.chatroomId.toString() === id.toString());
        if(chatroom){
            return chatroom;
        }else{
            return ;
        }
    }else{
        return ;
    }
}



// Delete Chatroom

userSchema.methods.deleteChatroom = function(id){
    let chats = [...this.chats];

    let index = chats.findIndex(chat => chat.chatroomId.toString() === id.toString());

    if(index > -1){
        chats.splice(index, 1);    
    }
    
    this.chats = chats;
    return this.save();
}


module.exports = model('User', userSchema);