module.exports = function(email,name,token){
  return{
    to:email,
    from: process.env.FROM_EMAIL,
    subject:`Are you forget password ?`,
    html:`
      <h3>Hello <i>${name}</i>, if you forgot your password then click on the link below and recover your account password:</h3>
      <p>Your have an hour to create a new password. Click link for create new password
        <a href="${process.env.BASE_URL}/auth/password/${token}">${token}</a>
      </p>
      <img src='${process.env.LOGO}'/>
      <hr>
      <h4>
        <a href="${process.env.BASE_URL}/courses">All Courses</a>
        aDoKa
      </h4>
    `
  }
}

