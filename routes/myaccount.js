const {Router} = require('express');
const auth = require('../middleware/auth');
const {accountPage, removeMyCourse} = require('../controllers/myAccountController');
const router = Router();


router.get('/', auth, accountPage);
router.delete('/remove/:id', auth, removeMyCourse);

module.exports = router;