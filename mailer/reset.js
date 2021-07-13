const keys = require('../keys');

module.exports = function(email,name,token){
 return{
  to:email,
  from: keys.FROM_EMAIL,
  subject:`Are you forget password ?`,
  html:`
    <h3>Hello <i>${name}</i>, if you forgot your password then click on the link below and recover your account password:</h3>
    <p>Your have an hour to create a new password. Click link for create new password
      <a href="${keys.BASE_URL}/auth/password/${token}">${token}</a>
    </p>
    <img src='${keys.LOGO}'/>
    <hr>
    <h4>
      <a href="${keys.BASE_URL}/courses">All Courses</a>
      aDoKa
    </h4>
  `
 }
}

