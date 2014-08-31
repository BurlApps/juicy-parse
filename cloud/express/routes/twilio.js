var Users = Parse.User
var Posts = Parse.Object.extend("Posts")
var Queue = Parse.Object.extend("ConfessionsQueue")
var Settings = require("cloud/util/settings")
var Facebook = require("cloud/util/facebook")

module.exports.auth = function(express) {
  return function(req, res, next) {
    Settings().then(function(settings) {
        req.settings = settings

        express.basicAuth(function(username, password) {
          return (username == settings.get("twilioUsername")) &&
                 (password == settings.get("twilioPassword")) &&
                 (req.param("To") == settings.get("twilioCreateNumber") || req.param("To") == settings.get("twilioConfessionNumber"))
        })(req, res, next)
    })
  }
}

module.exports.post = function(req, res, next) {
  var from = req.param("From")
  var body = req.param("Body")
  var images = [
    "http://www.heykiki.com/blog/wp-content/uploads/2013/09/a49.jpg",
    "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg",
    "http://cdn.surf.transworld.net/wp-content/blogs.dir/443/files/2013/08/Vans-Party.jpg",
    "http://norwich.tab.co.uk/files/2012/10/house-party21.jpg",
    "http://cdn.lipstiq.com/wp-content/uploads/2014/02/cover3.jpg",
    "http://static6.businessinsider.com/image/51f0432069beddd20a000004/email-ad-exec-demands-free-food-for-90-people-at-a-going-away-party.jpg"
  ]

  // Set Default
  req.newUser = false
  req.isConfession = !!req.isConfession

  // Find or Create User
  var query = new Parse.Query(Users)
  query.equalTo("phone", from)
  query.limit(1)

  query.find().then(function(users) {
    if(users.length != 0) {
      return users[0]
    }

    var user = new Users()
    req.newUser = true
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
      var post = new Posts()

      post.set("confession", req.isConfession)
      post.set("creator", user)
      post.set("image", image)
      post.set("content", [{
        color: false,
        message: body
      }])

      if(req.isConfession && req.isModerated) {
        var queue = new Queue()
        queue.set("post", post)
        queue.save()
      }

      return post.save()
    }).then(function() {
      next()
    })
  }, function(error) {
    console.error(error)
    next()
  })
}

module.exports.confession = function(req, res, next) {
  req.isConfession = true
  req.isModerated = false

  if(!req.settings.get("facebookModerate")) {
    Facebook.post(req.param("Body")).then(function(response) {
      next()
    }, function(error) {
      console.log(error)
      exports.response(req, res)
    })
  } else {
    req.isModerated = true
    next()
  }
}

module.exports.response = function(req, res) {
  res.render('twilio', {
    newUser: req.newUser,
    isConfession: req.isConfession
  })
}
