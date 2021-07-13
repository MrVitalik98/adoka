exports.homePage = (req,res) => {
    res.render('home',{
        error: req.flash('error'),
        success: req.flash('success')
    })
}