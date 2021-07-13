const { Schema, model } = require('mongoose');


const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    courses: {
        type: Array,
        required: true   
    },
    
    price: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }
},
    { versionKey: false }
)


module.exports = model('Order', orderSchema);