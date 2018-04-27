const {mongoose} = require('./../db/mongoose.js');

let TodoSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	completed: {
		type: Boolean,
		required:true,
		default: false
	},
	completedAt: {
		type: Number,
		default: null
	},
	_creator: {
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
});

let Todo = mongoose.model('Todo', TodoSchema);
module.exports = {Todo};