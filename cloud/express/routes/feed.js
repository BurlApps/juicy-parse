var _        = require('underscore')
var Posts    = Parse.Object.extend("Posts")
var Settings = require("cloud/util/settings")

module.exports.home = function(req, res) {
  res.render("feed/index", {
    template: "feed/index"
  })
}

module.exports.posts = function(req, res) {
  var results = []
  var images = req.param("images")

  Settings().then(function(settings) {
    var user = new Parse.User()
    req.settings = settings

    if(req.cookies[req.settings.get("confessionTracker")]) {
      user.id = req.cookies[req.settings.get("confessionTracker")]
      return user
    } else {
      var random = Math.random().toString(36).slice(2)
      user.set("username", random)
      user.set("password", random)
      user.set("admin", false)
      user.set("registered", false)
      user.set("terms", false)
      return user.signUp()
    }
  }).then(function(user) {
    res.cookie(req.settings.get("confessionTracker"), user.id, {
	    maxAge: 9000000000,
	    httpOnly: true
	  })

    var query = new Parse.Query(Posts)
    query.limit(10)

    query.equalTo("show", true)
    query.lessThanOrEqualTo("length", 350)
    query.notEqualTo("likedUsers", user)
    query.descending("createdAt")

    if(images == "true") {
      query.exists("image")
    } else if(images == "false") {
      query.doesNotExist("image")
    }

    query.find().then(function(posts) {
      var promise = Parse.Promise.as()

  		_.each(posts, function(post) {
        promise = promise.then(function() {
          var likedRelation = post.relation("likedUsers")
          var image = post.get("image")

          likedRelation.add(user)
          post.save()

          results.push({
            message: post.get("flatContent"),
            image: (image) ? image.url() : null,
            background: post.get("background") || [],
            alpha: post.get("darkenerAlpha")
          })
        })
      })

      return promise
    }).then(function() {
      if(results.length == 0) {
        res.clearCookie(req.settings.get("confessionTracker"))
        module.exports.posts(req, res)
      } else {
        res.json(results)
      }
    }, function(error) {
      console.log(error)
      res.json([])
    })
  })
}
