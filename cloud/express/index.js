// These two lines are required to initialize Express in Cloud Code.
var express = require('express')
var app = express()

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
routes = {
  core: require("cloud/express/routes/index"),
  twilio: require("cloud/express/routes/twilio"),
  notfound: require("cloud/express/routes/notfound")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')
app.use(express.bodyParser())

// Landing Route
app.get('/', routes.core.home)

// Terms Route
app.get('/terms', routes.core.terms)

// Privacy Route
app.get('/privacy', routes.core.privacy)

// Twilio Text to Post
app.post('/twilio', routes.twilio.auth(express), routes.twilio.post, routes.twilio.response)

// Facebook Confessions
app.post('/confession', routes.twilio.auth(express), routes.twilio.confession, routes.twilio.post, routes.twilio.response)

// Not Found Redirect
app.all("*", routes.notfound)

// Listen to Parse
app.listen()
