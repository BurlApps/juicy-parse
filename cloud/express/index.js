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

var Users = Parse.User
var Posts = Parse.Object.extend("Posts")
var Settings = Parse.Object.extend("Settings")
var newUser = false

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')
app.use(express.bodyParser())

// Landing Route
app.get('/', function(req, res) {
  res.render('index')
})

app.get('/terms', function(req, res) {
  res.render('terms')
})

// Twilio Text to Post
app.post('/twilio', function(req, res, next) {
  var query = new Parse.Query(Settings)

  query.first().then(function(settings) {
    if(settings) {
      express.basicAuth(function(username, password) {
        return (username == settings.get("twilioUsername")) &&
               (password == settings.get("twilioPassword")) &&
               (req.param("To") == settings.get("twilioCreateNumber"))
      })(req, res, next)
    } else {
      res.redirect('/')
    }
  }, function(error) {
    res.redirect('/')
  })
}, function(req, res, next) {
  // Set Variables
  var from = req.param("From")
  var body = req.param("Body")

  // Find or Create User
  var query = new Parse.Query(Users)
  query.equalTo("phone", from)
  query.limit(1)

  query.find().then(function(users) {
    if(users.length != 0) {
      return users[0]
    }

    var user = new Users()
    newUser = true
    user.set("username", from)
    user.set("password", from)
    user.set("phone", from)
    user.set("admin", false)
    user.set("registered", false)
    user.set("terms", false)

    return user.signUp()
  }).then(function(user) {
    return Parse.Cloud.httpRequest({
      url: images[Math.floor(Math.random() * images.length)]
    }).then(function(response) {
      return new Parse.File("image.jpg",  {
        base64: response.buffer.toString('base64')
      })
    }).then(function(image) {
      image.save()
      return image
    }).then(function(image) {
      var Posts = Parse.Object.extend("Posts")
      var post = new Posts()

      post.set("likes", 0)
      post.set("karma", 0)
      post.set("juicy", false)
      post.set("show", true)
      post.set("creator", user)
      post.set("image", image)
      post.set("content", [{
        color: false,
        message: body
      }])

      return post.save()
    }).then(function() {
      res.render('twilio', {
        newUser: newUser
      })
    })
  }, function(error) {
    console.error(error)
    res.render('twilio')
  })
})

// Listen to Parse
app.listen()
