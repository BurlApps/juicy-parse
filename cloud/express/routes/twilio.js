exports.auth = function(express) {
  return function(req, res, next) {
    var Settings = Parse.Object.extend("Settings")
    var query = new Parse.Query(Settings)

    query.first().then(function(settings) {
      if(settings) {
        req.settings = settings

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
  }
}

exports.post = function(req, res, next) {
  var Users = Parse.User
  var Posts = Parse.Object.extend("Posts")
  var newUser = false

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

      post.set("confession", !!req.isConfession)
      post.set("creator", user)
      post.set("image", image)
      post.set("content", [{
        color: false,
        message: body
      }])

      return post.save()
    }).then(function() {
      next()
    })
  }, function(error) {
    console.error(error)
    next()
  })
}

exports.confession = function(req, res) {
  Parse.Cloud.httpRequest({
    method: "POST",
    url: [
      'https://graph.facebook.com/',
      req.settings.get("facebookPage"),
      '/feed?&access_token=',
      req.settings.get("facebookID"),
      "|",
      req.settings.get("facebookSecret")
    ].join(""),
    body: {
      body: req.param("Body"),
      link: "http://getjuicyapp.com/ucsc",
      published: true
    }
  }).then(function(response) {
    console.log(response)
    req.isConfession = true
    next()
  })
}

exports.response = function(req, res) {
  res.render('twilio', {
    newUser: newUser,
    isConfession: !!req.isConfession
  })
}
