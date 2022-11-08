const {Schema,model} = require('mongoose');

const courseSchema = new Schema({
    title:{
        type:String,
        requried:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    text:String,

    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},
    { versionKey: false }
)

module.exports = model('Course', courseSchema);