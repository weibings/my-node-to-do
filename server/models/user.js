const {mongoose} = require('./../db/mongoose.js');

const _ = require('lodash');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let UserSchema = new mongoose.Schema({
	email: {
		type: String,
		require: true,
		minlength: 6,
		unique: true,
		trim: true,
		validate: validator.isEmail
		},
	password: {
		required: true,
		type: String,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function() {
	let user = this;
	return _.pick(user.toObject(), ['email', '_id']);
}

UserSchema.methods.generateAuthToken = function() {
	let user = this;
	let access = 'auth';
	let token = jwt.sign({_id: user._id, access}, process.env.JWT_SECRET).toString();
	user.tokens.push({access, token});
	return token;
}

UserSchema.statics.findByEmail = function(req, res) {
	let email = req.body.email;
	let password = req.body.password;
	User.findOne({email}).then((user) => {
		if (!user) {
			return res.status(400).send('Email not found');
		}
		bcrypt.compare(password, user.password).then((result) => {
			if (result) {
				return res.status(200).send("Succesfully logged in");
			}else{
				return res.status(400).send('Wrong password');
			}
		})
	}).catch((e) => {
		res.status(400).send(e);
	})
}

UserSchema.methods.removeToken = function(token) {
	let user = this;

	return user.update({$pull : {tokens: {token}}});
}

UserSchema.pre('save', function(next) {

	let user = this;
	if(user.isModified('password')){
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(user.password, salt, function(err, hash){

				user.password = hash;
				next();
			})
		});
	}else{
		next();
	}
	
})

let User = mongoose.model('User', UserSchema);

module.exports = {User};