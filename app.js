const path = require('path')
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const tourRouter = require('./routes/tourRouter')
const userRouter = require('./routes/userRouter')
const reviewRouter = require('./routes/reviewRouter')
const globalErrorHandler = require('./controllers/errorController')
const AppError = require('./util/appError')

const app = express()
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))





// GLOBAL MIDDLEWARE

// sever static files
app.use(express.static(path.join(__dirname, 'public')))

// set security http headers
app.use(helmet())

// rate limit middleware
const limit = rateLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: 'To many requests from this ip! Try again in one hour. 😉'
})
app.use('/api', limit)

// body parser
app.use(express.json({ limit: '10kb' }))

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['ratingsAverage', 'ratingsQuantity', 'duration', 'maxGroupSize', 'difficulty', 'price']
}))







// routes
app.use('/', (req, res) => {
    res.status(200).render('base')
})

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)


// error function for unknown requests
app.all('*', (req, res, next) => {
    next(new AppError(`Can't access ${req.originalUrl} on this server`, 404))
})


// error middleware
app.use(globalErrorHandler)




module.exports = app