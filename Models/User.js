const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const userSchema=new Schema({
	Email:{
		type:String,
		required:true,
		lowercase:true,
	},
	salt:{
		type:String,
		required:true,
	},
	hash:{
		type:String,
		required:true,
	},
	activated:{
		type:Boolean,
		default:false
	},
	activationToken:{
		type:String,
	},
	activationTokenCreatedOn:{
		type:String,
	},
})

module.exports = mongoose.model('User', userSchema);