const {Router} = require('express');
const {registerValidator} = require('../utils/validators');
const {loginValidator} = require('../utils/validators');
const {registerPage, logoutFromAccount, resetPage, newPasswordPage, newPassword, loginAccount, registerNewAccount, resetToEmail} = require('../controllers/authController');
const router = Router();


router.get('/register', registerPage);
router.get('/logout', logoutFromAccount);
router.get('/reset', resetPage);
router.get('/password/:token', newPasswordPage);
router.post('/login', loginValidator, loginAccount)
router.post('/register', registerValidator, registerNewAccount)
router.post('/reset', loginValidator.slice(0,1), resetToEmail);
router.post('/password', registerValidator.slice(3), newPassword)

module.exports = router;