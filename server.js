// Imports
import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connect.js'
import cors from 'cors'
import 'express-async-errors'
import morgan from 'morgan'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

// const __dirname = dirname(fileURLToPath(import.meta.url))

// initialize the server
dotenv.config()
const app = express()

import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

// only when ready to deploy
// app.use(express.static(path.resolve(__dirname, './client/build')))

if (process.env.NODE_ENV !== 'production') {
	app.use(morgan('dev'))
}
app.use(express.json())
app.use(cors())

// Import middleware.
import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddleware from './middleware/error-handler.js'
import authenticateUser from './middleware/auth.js'

//routers
import authRoutes from './routes/authRoutes.js'
import jobsRoutes from './routes/jobsRoutes.js'

//Connect to the database
connectDB()
// Routes
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the Job Board' })
})

// only when ready to deploy
// app.get('*', function (request, response) {
// 	response.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
// })

//Routes.
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/jobs', authenticateUser, jobsRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server is listening on port ${port}...`))
