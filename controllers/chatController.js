const User = require('../models/user');
const Chat = require('../models/chat');


function mapChats(arr, id){
	return arr.map(async i => {
		let to = [...i.chatroomId._doc.users].find(a => a.user.toString() !== id.toString())._doc;
		let messages = [...i.chatroomId._doc.messages];
		let lastMessage = '';
		if(messages.length){
			lastMessage = messages[messages.length - 1].message;
		}

		let user = await User.findById(to.user);

		if(!user){
			user = {
				_id: '',
				avatarURL: '',
				firstname: 'Account is deleted'
			}
		}

		return {
			id: i.chatroomId._doc._id,
			messages, user, lastMessage
		}				
	})
}


exports.chats = async (req, res) => {
	let user = await req.user
					.populate('chats.chatroomId')
					.execPopulate();

	let chats = mapChats(user.chats, req.user._id);

	chats = await Promise.all(chats);
	let isEmpty = chats.filter(c => c.messages.length > 0);

	res.render('message', {
		title: '/Chats',
		chats, isEmpty
	})
}


exports.deleteChatroom =  async (req, res) => {
	try{
		let user = await User.findById(req.body.userId);
		await Chat.findByIdAndDelete(req.params.id);
		await req.user.deleteChatroom(req.params.id);
		await user.deleteChatroom(req.params.id);
		res.send();
	}catch(err){
		console.log(err);
	}
};
