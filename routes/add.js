const {Router} = require('express');
const auth = require('../middleware/auth');
const {courseValidator} = require('../utils/validators');
const {addPage, addNewCourse} = require('../controllers/addController');
const router = Router();


router.get('/', auth, addPage)
router.post('/course', auth, courseValidator, addNewCourse);

module.exports = router;