const {Router} = require('express');
const {createrCourse} = require('../controllers/accountController');
const router = Router();


router.get('/:id', createrCourse)

module.exports = router;