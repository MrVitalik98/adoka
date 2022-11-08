let {Schema, model} = require('mongoose');

let chatSchema = new Schema({
	users:[
		{
			user:{
				type: Schema.Types.ObjectId,
				ref: 'User'
			}
		}
	],
	messages: [
		{
			user:{
				type: Schema.Types.ObjectId,
				ref: 'User'
			},
			message: String,
			date: Date
		}
	]
},
	{
		versionKey: false
	}
);


chatSchema.methods.addMessage = function(user, message, date){
	let messages = [...this.messages];

	messages.push({user, message, date});
	this.messages = messages;
	return this.save();
}


chatSchema.methods.addUsers = function(user1_ID, user2_ID){
	let users = [...this.users];
	let messages = [...this.messages];

	users = [
		{user1: user1_ID},
		{user2: user2_ID}
	];

	messages = [];

	this.users = users;
	this.messages = message;
	return this.save();
}


chatSchema.methods.findUser = function(id){
	let users = [...this.users];

	let f = users.find(u => u.user.toString() !== id.toString());
	return f.user; 
}


chatSchema.methods.findMessageID = function(userID){
	let messages = [...this.messages];
	let userMessages = messages.filter(u => u.user.toString() === userID.toString());
	
	if(userMessages.length){
		return userMessages[userMessages.length - 1];
	}
}


chatSchema.methods.deleteMessage = function(msgID){
	let messages = [...this.messages];
	let index = messages.findIndex(msg => msg._id.toString() === msgID.toString());

	if(index > -1){
		messages.splice(index, 1);
	}

	this.messages = messages;
	return this.save();
}


module.exports = model('Chat', chatSchema);