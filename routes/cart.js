const {Router} = require('express');
const auth = require('../middleware/auth');
const {userCart, addToCart, increaseTheAmount, removeCourseFromCart} = require('../controllers/cartController');
const router = Router();


router.get('/', auth, userCart)
router.post('/add/:id', auth, addToCart)
router.post('/amount/:id', auth, increaseTheAmount)
router.delete('/remove/:id', auth, removeCourseFromCart)

module.exports = router;