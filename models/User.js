import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide name'],
		minlength: 3,
		maxlength: 20,
		trim: true,
	},
	email: {
		type: String,
		required: [true, 'Please provide email'],
		validate: {
			validator: validator.isEmail,
			message: 'Please provide a valid email',
		},
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Please provide password'],
		minlength: 6,
		select: false, // excludes the password from the response.
	},
	lastName: {
		type: String,
		trim: true,
		maxlength: 20,
		default: 'Kisyula',
	},
	location: {
		type: String,
		trim: true,
		maxlength: 20,
		default: 'Nairobi, Kenya',
	},
})

// UserSchema.pre('save', async function (next)  this is a middleware which is executed before the save method is executed. It is used to hash the password before it is saved to the database.
UserSchema.pre('save', async function () {
	// console.log(this.modifiedPaths())
	if (!this.isModified('password')) return
	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})

// UserSchema.methods.createJWT = function ()  this is a method which is used to create a JSON Web Token. It is used to create a token which is used to authenticate the user.
UserSchema.methods.createJWT = function () {
	return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_LIFETIME,
	})
}

// UserSchema.methods.comparePassword = function (password)  this is a method which is used to compare the password with the hashed password in the database.
UserSchema.methods.comparePassword = async function (candidatePassword) {
	const isMatch = await bcrypt.compare(candidatePassword, this.password)
	return isMatch
}

export default mongoose.model('User', UserSchema)
