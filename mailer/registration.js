const keys  = require('../keys');

module.exports = function(email,name){
 return{
  to: email,
  from: keys.FROM_EMAIL,
  subject:`Account created successfully`,
  html: `
   <h3>Hello <i>${name}</i>, thanks for registration</h3>
   <h4>Welcome to project courses <big>aDoKa</big></h4>
   <img src='${keys.LOGO}'/>
   <hr>
   <h4>
     <a href="${keys.BASE_URL}/courses">All Courses</a>
     aDoKa
   </h4>
  `
 }
}

