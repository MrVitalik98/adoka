const {Router} = require('express');
const {chats, deleteChatroom} = require('../controllers/chatController');
const auth = require('../middleware/auth');
const router = Router();


router.get('/', auth, chats);
router.post('/:id', auth, deleteChatroom);

module.exports = router;