const {Router} = require('express');
const {openChatroom, chatroom} = require('../controllers/chatroomController');
const auth = require('../middleware/auth');
const router =  Router()


router.get('/:id', auth, openChatroom)
router.post('/', auth, chatroom)

module.exports = router;
