const Chat = require('../models/chat');
const User = require('../models/user');


exports.openChatroom = async (req, res) => {
	try{
		let chatroomId = req.params.id;
		let userChatroom = await req.user.findChat(chatroomId);
		let chat = await Chat.findById(chatroomId);

		if(userChatroom){
			let userId = await chat.findUser(req.user._id);
			let person = await User.findById(userId);

			if(!person){
				person = {
					_id: '',
					avatarURL: '',
					firstname: 'Account is deleted'
				}
			}

			res.render('chatroom', {
				title: '| Chatroom',
				person, chat
			})
		}else{
			res.sendStatus(404);
		}
	}catch(err){
		res.redirect('/chats')
	}
};


exports.chatroom = async (req, res) => {
	let user1_ID = req.user._id;
	let user2_ID = req.body.id;
	let user = await User.findById(req.body.id);
	let chat;


	try{
		let chats = await Chat.find();
		if(chats.length){
			let chatroom = chats.find(item => {
				return item.users.every(u => u.user.toString() === user1_ID.toString() || u.user.toString() === user2_ID.toString())
			})
			
			if(chatroom){
				chat = chatroom;
			}else{
				let newChatRoom = await Chat.create({
					users:[
				    	{ user: user1_ID },
						{ user: user2_ID }
					],
					messages: []
				});

				chat = newChatRoom;

				await req.user.addChatRoom(chat._id);
				await user.addChatRoom(chat._id);
			}

		}else{
			let newChatRoom = await Chat.create({
				users:[
					{ user: user1_ID },
					{ user: user2_ID }
				],
				messages: []
			});

			chat = newChatRoom;

			await req.user.addChatRoom(chat._id);
			await user.addChatRoom(chat._id);
		}

		res.redirect(`/chatroom/${chat._id}`);
	}catch(err){
		console.log(err);
	}
}



