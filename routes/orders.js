const {Router} = require('express');
const auth = require('../middleware/auth');
const { userOrders, makeInOrder, removeOrder, addNewOrderToUserOrders, paymentWithPaypal, openCourse } = require('../controllers/ordersController');
const router = Router();


router.get('/', auth, userOrders);
router.get('/added_order', auth, addNewOrderToUserOrders);
router.get('/:id', auth, openCourse);
router.post('/pay', auth, paymentWithPaypal);
router.post('/', auth, makeInOrder);
router.delete('/remove/:id', auth, removeOrder);

module.exports = router;