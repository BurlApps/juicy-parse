// These two lines are required to initialize Express in Cloud Code.
var express = require('express')
var app = express()
var images = [
  "http://www.heykiki.com/blog/wp-content/uploads/2013/09/a49.jpg",
  "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg",
  "http://cdn.surf.transworld.net/wp-content/blogs.dir/443/files/2013/08/Vans-Party.jpg",
  "http://norwich.tab.co.uk/files/2012/10/house-party21.jpg",
  "http://cdn.lipstiq.com/wp-content/uploads/2014/02/cover3.jpg",
  "http://static6.businessinsider.com/image/51f0432069beddd20a000004/email-ad-exec-demands-free-food-for-90-people-at-a-going-away-party.jpg"
]

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
routes = {
  home: require("cloud/express/routes/index"),
  terms: require("cloud/express/routes/index")
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')
app.use(express.bodyParser())

// Landing Route
app.get('/', routes.home)

// Terms Route
app.get('/terms', routes.terms)

// Twilio Text to Post
app.post('/twilio', twilio.auth, twilio.post)

// Listen to Parse
app.listen()
