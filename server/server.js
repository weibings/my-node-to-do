require('./config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {ObjectID} =require('mongodb');


const mongoose = require('./db/mongoose.js');
const {User} = require('./models/user.js');
const {Todo} = require('./models/todo.js');
const authenticate = require('./middleware/authenticate.js');


const port = process.env.PORT;


let app = express();
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
	let todo = new Todo({
		text: req.body.text,
		completed: req.body.completed,
		_creator: req.user._id
	});
	console.log(123);
	todo.save().then((doc) => {
		res.status(200).send(doc);
	}).catch((e) => {
		res.status(400).send(e);
	})
})

app.get('/todos', authenticate, (req, res) => {
	Todo.find({_creator: req.user._id}).then((todos) => {
		if (todos) {
			return res.send({todos});
		}else{
			res.send('No todos found');
		}
	}).catch((e) => {
		res.status(400).send(e);
	})
});

app.get('/todos/:id', authenticate, (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)) {
		return res.status(400).send('Bad Id');
	}
	Todo.findOne({_creator: req.user._id, _id: id}).then((todo) => {
		if (todo) {
			return res.send({todo});
		}else{
			res.status(404).send('Not found');
		}
	}).catch((e) => {
		res.status(400).send(e);
	})
});

app.delete('/todos/:id', authenticate, (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)) {
		return res.status(400).send('Bad Id');
	}
	Todo.findOneAndRemove({_creator: req.user._id, _id: id}).then((todo) => {
		if (todo) {
			return res.send({todo});
		}else{
			res.status(404).send('Not found');
		}
	}).catch((e) => {
		res.status(400).send(e);
	})
})

app.patch('/todos/:id', authenticate, (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)) {
		return res.status(400).send('Bad Id');
	}

	let body = _.pick(req.body, ['text', 'completed']);
	if(_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	}else{
		body.completed = false;
		body.completedAt = null;
	}
	Todo.findOneAndUpdate({_creator: req.user._id, _id: id}, {$set: body}, {new : true}).then((todo) => {
		if (todo) {
			return res.send({todo});
		}else{
			res.status(404).send('Not found');
		}
	}).catch((e) => {
		res.status(400).send(e);
	})
})


app.post('/users', (req, res) => {

	let body = _.pick(req.body, ['email', 'password']);

	let user = new User(body);

	let token = user.generateAuthToken();

	user.save().then(()=>{
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	})
})


app.post('/users/login', (req, res) => {
	User.findByEmail(req, res);
})

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
})

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	})
})

app.listen(port, () => {
	console.log(`Started port ${port}`)
})