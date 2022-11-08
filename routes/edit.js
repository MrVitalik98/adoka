const {Router} = require('express');
const auth = require('../middleware/auth');
const {courseValidator} = require('../utils/validators');
const {editPage, editCourse} = require('../controllers/editController');
const router = Router();


router.get('/:id', auth, editPage)
router.post('/:id', auth, courseValidator, editCourse)

module.exports = router;