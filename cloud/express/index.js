// These two lines are required to initialize Express in Cloud Code.
var express = require('express')
var app = express()

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
routes = {
  core: require("cloud/express/routes/index"),
  twilio: require("cloud/express/routes/twilio"),
  moderator: require("cloud/express/routes/moderator"),
  notfound: require("cloud/express/routes/notfound")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')

app.use(express.bodyParser())
app.use(function(req, res, next) {
  req.basicAuth = express.basicAuth
  next()
})

// Landing
app.get('/', routes.core.home)

// Terms
app.get('/terms', routes.core.terms)

// Privacy
app.get('/privacy', routes.core.privacy)

// Twilio Text to Post
app.post('/twilio', routes.twilio.auth, routes.twilio.post, routes.twilio.response)

// Facebook Confessions
app.post('/confession', routes.twilio.auth, routes.twilio.confession, routes.twilio.post, routes.twilio.response)

// Moderator Route
app.get('/moderator', routes.moderator.auth, routes.moderator.home)
app.get('/moderator/confessions', routes.moderator.auth, routes.moderator.confessions)
app.post('/moderator/confession', routes.moderator.auth, routes.moderator.post)
app.delete('/moderator/confession', routes.moderator.auth, routes.moderator.delete)

// Not Found Redirect
app.all("*", routes.notfound)

// Listen to Parse
app.listen()
