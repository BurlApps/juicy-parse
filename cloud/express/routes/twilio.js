var Users = Parse.User
var Posts = Parse.Object.extend("Posts")
var Queue = Parse.Object.extend("ConfessionsQueue")
var Settings = require("cloud/util/settings")
var Facebook = require("cloud/util/facebook")

module.exports.auth = function(req, res, next) {
  Settings().then(function(settings) {
      req.settings = settings

      req.basicAuth(function(username, password) {
        return (username == settings.get("twilioAuthUsername")) &&
               (password == settings.get("twilioAuthPassword")) &&
               ([
                  settings.get("twilioCreateNumber"),
                  settings.get("twilioConfessionNumber")
                ].indexOf(req.param("To")) != -1)
      })(req, res, next)
  })
}

module.exports.post = function(req, res, next) {
  var from = req.param("From")
  var body = req.param("Body")

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
    var post = new Posts()

    post.set("background", Settings.getBackground(req.settings))
    post.set("confession", req.isConfession)
    post.set("show", false)
    post.set("creator", user)
    post.set("content", [{
      color: false,
      message: body
    }])

    if(req.isConfession) {
      var queue = new Queue()
      queue.set("source", "sms")
      queue.set("post", post)
      queue.set("show", req.isModerated)
      queue.save()
    }

    return post.save()
  }).then(function() {
    next()
  }, function(error) {
    console.error(error)
    next()
  })
}

module.exports.confession = function(req, res, next) {
  req.isConfession = true
  req.isModerated = req.settings.get("facebookModerate")

  if(!req.isModerated) {
    Facebook.post(req.param("Body")).then(function(response) {
      next()
    }, function(error) {
      console.log(error)
      exports.response(req, res)
    })
  } else {
    next()
  }
}

module.exports.response = function(req, res) {
  res.render('twilio', {
    newUser: req.newUser,
    isConfession: req.isConfession
  })
}
