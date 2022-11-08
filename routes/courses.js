const {Router} = require('express');
const {allCourses, course, findCourses, coursesPage} = require('../controllers/coursesController');
const router = Router();


router.get('/', allCourses);
router.get('/:id', course);
router.post('/', findCourses);
router.post('/page', coursesPage);

module.exports = router;