var Settings = require("cloud/util/settings")
var express = require('express')
var app = express()
var random = Math.random().toString(36).slice(2)

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
var routes = {
  core: require("cloud/express/routes/index"),
  confession: require("cloud/express/routes/confession"),
  twilio: require("cloud/express/routes/twilio"),
  moderator: require("cloud/express/routes/moderator"),
  moderators: require("cloud/express/routes/moderators"),
  spam: require("cloud/express/routes/spam"),
  search: require("cloud/express/routes/search"),
  images: require("cloud/express/routes/images"),
  posts: require("cloud/express/routes/posts"),
  feed: require("cloud/express/routes/feed")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')

app.enable('trust proxy')

app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.cookieSession({
  secret: 'ursid',
  cookie: {
    httpOnly: true
  }
}))
app.use(express.csrf())
app.use(routes.core.schools)
app.use(function(req, res, next) {
  // Auth
  req.basicAuth = express.basicAuth
  res.locals.csrf = req.session._csrf

  // Locals
  res.locals.host = req.protocol + "://" + req.host
  res.locals.url = res.locals.host + req.url
  res.locals.admin = !!req.session.admin
  res.locals.moderator = !!req.session.user
  res.locals.school = null
  res.locals.schools = req.session.schools || []
  res.locals.allSchools = req.session.allSchools || []
  res.locals.random = random

  if(req.session.appliedSettings !== true) {
    Settings().then(function(settings) {
	    req.session.appliedSettings = true
	    req.session.enforceSSL = settings.get("enforceSSL")
	    req.session.production = settings.get("production")
	    req.session.itunesApp = settings.get("itunesApp")
      req.session.gaTracking = settings.get("gaTracking")
      res.locals.gaTracking = req.session.gaTracking
      res.locals.itunesApp = req.session.itunesApp
      next()
    }, function(error) {
      console.log(error)
      next()
    })
  } else {
    res.locals.gaTracking = req.session.gaTracking || ""
    res.locals.itunesApp = req.session.itunesApp || ""
    next()
  }
})
app.use(function(req, res, next) {
  var schema = req.headers['x-forwarded-proto']

  if(!req.session.enforceSSL || schema === 'https') {
    next()
  } else {
    res.redirect('https://' + req.headers.host + req.url)
  }
})

// Landing
app.get('/', routes.core.home)
app.post('/phone', routes.core.phone)

// Download
app.get('/d', routes.core.download)
app.get('/download', routes.core.download)
app.get('/d/:post', routes.core.download)
app.get('/download/:post', routes.core.download)

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

// Search
app.get('/search', routes.search.home)
app.post('/search', routes.search.search)

// Images
app.get('/i/:post', routes.images.home)
app.get('/images/:post', routes.images.home)

// Posts
app.get('/p/:post', routes.posts.home)
app.get('/posts/:post', routes.posts.home)

// Confessions
app.get('/confession', routes.confession.redirect)
app.get('/confessions', routes.confession.redirect)
app.get('/confession/:school', routes.confession.home)
app.get('/confessions/:school', routes.confession.redirect)
app.post('/confession', routes.confession.post)

// TWILIO INBOUND: Juicy Posts
app.get('/twilio/juicy', routes.twilio.auth, routes.twilio.post, routes.twilio.response)

// TWILIO INBOUND: Facebook Confessions
app.get('/twilio/confession', routes.twilio.auth, routes.twilio.confession, routes.twilio.post, routes.twilio.response)

// Feed
app.get('/feed', routes.feed.home)
app.get('/feed/posts', routes.feed.posts)

// Moderators Route
app.get('/moderators', routes.moderators.auth, routes.moderators.home)
app.get('/moderators/new', routes.moderators.auth, routes.moderators.new)
app.get('/moderators/remove/:user', routes.moderators.auth, routes.moderators.remove)
app.post('/moderators/new', routes.moderators.auth, routes.moderators.create)
app.post('/moderators/:user/:school', routes.moderators.auth, routes.moderators.school)

// Moderator Route
app.get('/moderator', routes.moderator.auth, routes.moderator.home)
app.get('/moderator/confessions', routes.moderator.auth, routes.moderator.confessions)
app.get('/moderator/logout', routes.moderator.logout)
app.post('/moderator/login', routes.moderator.login)
app.post('/moderator/confession', routes.moderator.auth, routes.moderator.post)
app.delete('/moderator/confession', routes.moderator.auth, routes.moderator.delete)
app.put('/moderator/confession', routes.moderator.auth, routes.moderator.spam, routes.moderator.delete)

app.get('/moderator/spam', routes.moderator.auth, routes.spam.home)
app.get('/moderator/spam/confessions', routes.moderator.auth, routes.spam.confessions)
app.post('/moderator/spam/confession', routes.moderator.auth, routes.spam.revert)
app.delete('/moderator/spam/confession', routes.moderator.auth, routes.moderator.delete)

app.get('/moderator/:school/writer', routes.moderator.auth, routes.confession.home)
app.get('/moderator/:school/spam', routes.moderator.auth, routes.spam.home)
app.get('/moderator/:school', routes.moderator.auth, routes.moderator.home)

// Not Found Redirect
app.all("*", routes.core.notfound)

// Listen to Parse
app.listen()
