import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js'

// const getUser = async (req, res) => {} this register function is used to register a new user.
const register = async (req, res) => {
	// const { email, password, name, lastName, location } = req.body // this is used to get the values from the request body.
	const { name, email, password } = req.body
	// this is used to check if the email, name and password are provided.
	if (!name || !email || !password) {
		throw new BadRequestError('please provide all values')
	}

	// const user = new User({ name, email, password }) // this is used to find the user in the database. If the user is not found, then it will create a new user.
	const userAlreadyExists = await User.findOne({ email })
	if (userAlreadyExists) {
		throw new BadRequestError('Email already in use')
	}
	//const user = new User({ name, email, password }). Create a new user with the values provided in the request body in the database.
	const user = await User.create({ name, email, password })
	const token = user.createJWT() // this is used to create a JSON Web Token. It is used to create a token which is used to authenticate the user.

	//Sends back user details and token to client excluding the password.
	res.status(StatusCodes.CREATED).json({
		user: {
			email: user.email,
			lastName: user.lastName,
			location: user.location,
			name: user.name,
		},
		token,
		location: user.location,
	})
}

// const login = async (req, res) => {} Used to login a user and create a token which is used to authenticate the user.
const login = async (req, res) => {
	const { email, password } = req.body
	// Used to check if the email and password are provided.
	if (!email || !password) {
		throw new BadRequestError('Please provide all values')
	}
	// Used to find the user in the database. If the user is found, then it will select the user and the password.
	const user = await User.findOne({ email }).select('+password')

	// Used to check if the user is found. If the user is not found, then it will throw an error.
	if (!user) {
		throw new UnAuthenticatedError('Invalid Credentials')
	}
	// Used to check if the password is correct. If the password is incorrect, then it will throw an error. It uses the comparePassword function to check if the password is correct. comparePassword comes from the User model through the bcryptjs library.
	const isPasswordCorrect = await user.comparePassword(password)
	if (!isPasswordCorrect) {
		throw new UnAuthenticatedError('Invalid Credentials')
	}
	// Used to create a JSON Web Token. It is used to create a token which is used to authenticate the user.
	const token = user.createJWT()
	user.password = undefined
	res.status(StatusCodes.OK).json({ user, token, location: user.location })
}

// const updateUser = async (req, res) => {} Used to update the user details.
const updateUser = async (req, res) => {
	const { email, name, lastName, location } = req.body
	if (!email || !name || !lastName || !location) {
		throw new BadRequestError('Please provide all values')
	}
	// Used to find the user in the database. If the user is found, then it will update the user.
	const user = await User.findOne({ _id: req.user.userId })
	user.email = email
	user.name = name
	user.lastName = lastName
	user.location = location
	await user.save()

	// various setups
	// in this case only id
	// if other properties included, must re-generate

	const token = user.createJWT()
	res.status(StatusCodes.OK).json({
		user,
		token,
		location: user.location,
	})
}

export { register, login, updateUser }
