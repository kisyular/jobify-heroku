import { UnAuthenticatedError } from '../errors/index.js'
import jwt from 'jsonwebtoken'

const auth = async (req, res, next) => {
	const authHeader = req.headers.authorization

	// Check if there is no token. Throw error. This is the first middleware. It will be called before the other middleware.
	if (!authHeader || !authHeader.startsWith('Bearer')) {
		// why, well is it 400 or 404?
		// actually 401
		throw new UnAuthenticatedError('Authentication Invalid')
	}
	const token = authHeader.split(' ')[1]
	try {
		// verify the token and get the userId
		const payload = jwt.verify(token, process.env.JWT_SECRET)
		// console.log(payload)
		//req.user = payload

		//Attach the user to the request object. The payload is the userId. It comes from the User Model. See models/User.js or below
		// return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME,})
		req.user = { userId: payload.userId }
	} catch (err) {
		throw new UnAuthenticatedError('Authentication Invalid')
	}

	next()
}

export default auth
