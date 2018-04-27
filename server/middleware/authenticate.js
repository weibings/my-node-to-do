const {User} = require('./../models/user.js');
const jwt = require('jsonwebtoken');

let authenticate = (req, res, next) => {
	let token = req.header('x-auth');
	let decoded;
	try{
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	}catch(e){
		return res.status(400).send(e);
	}

	User.findOne({'_id': decoded._id, 'tokens.access': 'auth', 'tokens.token': token}).then((user) => {
		if(!user) {
			return Promise.reject();
		}
		req.user = user;
		req.token = token;
		next();
	}).catch((e) => {
		res.status(400).send(e);
	})
}

module.exports = authenticate;