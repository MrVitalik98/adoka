let {Router} = require('express');
const auth = require('../middleware/auth');
const {fileValidator} = require('../utils/validators');
const {registerValidator} = require('../utils/validators');
const {passwordValidator} = require('../utils/validators');
const {settingsPage, changeAvatar, removeAvatar, changeName, changePassword, removeAccount} = require('../controllers/settingsController');
const router = Router();


router.get('/', auth, settingsPage);
router.post('/change_avatar', auth, fileValidator, changeAvatar);
router.post('/remove_avatar/:id', auth, removeAvatar)
router.post('/change_name', auth, registerValidator.slice(0,2), changeName);
router.post('/change_password', auth, passwordValidator,  changePassword);
router.post('/remove_account', auth, removeAccount);

module.exports = router;