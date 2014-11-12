var _        = require('underscore')
var Posts    = Parse.Object.extend("Posts")

module.exports.home = function(req, res) {
  res.render("feed/index", {
    template: "feed/index"
  })
}

module.exports.posts = function(req, res) {
  var results = []
  var images = req.param("images")

  var query = new Parse.Query(Posts)
  query.limit(10)

  query.equalTo("show", true)
  query.lessThanOrEqualTo("length", 350)
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
        var image = post.get("image")

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
    res.json(results)
  }, function(error) {
    console.log(error)
    res.json([])
  })
}
