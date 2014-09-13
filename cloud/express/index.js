// These two lines are required to initialize Express in Cloud Code.
var express = require('express')
var app = express()

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
routes = {
  core: require("cloud/express/routes/index"),
  confession: require("cloud/express/routes/confession"),
  twilio: require("cloud/express/routes/twilio"),
  moderator: require("cloud/express/routes/moderator"),
  spam: require("cloud/express/routes/spam"),
  notfound: require("cloud/express/routes/notfound")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')

app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.cookieSession({
  secret: 'ursid',
  cookie: {
    httpOnly: true
  }
}))
app.use(express.csrf())
app.use(function(req, res, next) {
  req.basicAuth = express.basicAuth
  res.locals.csrf = req.session._csrf
  next()
})

// Landing
app.get('/', routes.core.home)
app.post('/tester', routes.core.tester)

// Terms
app.get('/terms', routes.core.terms)

// Privacy
app.get('/privacy', routes.core.privacy)

// Robots
app.get('/robots', routes.core.robots)
app.get('/robots.txt', routes.core.robots)

// Sitemap
app.get('/sitemap', routes.core.sitemap)
app.get('/sitemap.xml', routes.core.sitemap)

// Confessions
app.get('/confession', routes.confession.home)
app.get('/confessions', routes.confession.home)
app.post('/confession', routes.confession.post)
app.post('/confessions', routes.confession.post)

// TWILIO INBOUND: Juicy Posts
app.get('/twilio/juicy', routes.twilio.auth, routes.twilio.post, routes.twilio.response)

// TWILIO INBOUND: Facebook Confessions
app.get('/twilio/confession', routes.twilio.auth, routes.twilio.confession, routes.twilio.post, routes.twilio.response)

// Moderator Route
app.get('/moderator', routes.moderator.auth, routes.moderator.home)
app.get('/moderator/confessions', routes.moderator.auth, routes.moderator.confessions)
app.post('/moderator/confession', routes.moderator.auth, routes.moderator.post)
app.delete('/moderator/confession', routes.moderator.auth, routes.moderator.delete)
app.put('/moderator/confession', routes.moderator.auth, routes.moderator.spam)

app.get('/moderator/spam', routes.moderator.auth, routes.spam.home)
app.get('/moderator/spam/confessions', routes.moderator.auth, routes.spam.confessions)
app.post('/moderator/spam/confession', routes.moderator.auth, routes.spam.revert)

// Not Found Redirect
app.all("*", routes.notfound)

// Listen to Parse
app.listen()
