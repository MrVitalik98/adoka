const {Router} = require('express');
const {homePage} = require('../controllers/homeController');
const isAuth = require('../middleware/isAuth');
const router = Router();

router.get('/', isAuth, homePage);

module.exports = router;