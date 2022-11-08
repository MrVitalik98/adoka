const {body} = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');


module.exports.registerValidator = [
   body('frname', 'Firstname should not be less than 3 letters').isLength({min:3}).trim(),
   body('lsname', 'Lastname should not be less than 3 letters').isLength({min:3}).trim(),
   body('email', 'Enter correct email').isEmail().custom( async (value, {req}) => {
      const user = await User.findOne({ email:value });
      if(user){
         return Promise.reject('Such email exists');
      }
   }).normalizeEmail().trim(),
   body('pass', 'Password should not be less than 6 letters').isLength({min:6, max:25}).isAlphanumeric().trim(),
   body('repass').custom((value, {req}) => {
      if(value !== req.body.pass){
         throw new Error('Password mismatch');
      }
      return true
   }).trim()
];


module.exports.courseValidator = [
   body('title').custom(value => {
      if(!value){
         throw new Error('Please write course title');
      }
      if(value.length < 2){
         throw new Error('Title should not be less than 2 letters')
      }
      return true
   }).trim(),

   body('price', 'Please write course price').isNumeric().isLength({min:1}).trim(),
   body('image', 'Please enter a URL').isURL().trim()
];


module.exports.loginValidator = [
   body('email', 'Please enter correct email').isEmail().normalizeEmail().trim(),
   body('pass', 'Password should not be less than 6 letters').isLength({min:6}).trim()
];


module.exports.fileValidator = [
   body('avatar').custom(value => {
      if(!value){
         throw new Error('Please select a file');
      }
      return true
   }).trim()
];


module.exports.passwordValidator = [
   body('currentpass').custom(async (value, {req}) => {
      const user = await User.findById(req.user._id);
      const password = await bcrypt.compare(value, user.password);
      if(!password){
         throw new Error('Current password is wrong');
      }
      return true
   }).trim(),

   body('newpass', 'New Password should not be less than 6 letters').custom((value, {req}) => {
      if(value == req.body.currentpass){
         throw new Error('Please write new password')
      }      
      return true
   }).isLength({min:6}).trim(),
   
   body('confirm').custom((value, {req}) => {
      if(value !== req.body.newpass){
         throw new Error('Password mismatch')
      }
      return true
   }).trim()
]
