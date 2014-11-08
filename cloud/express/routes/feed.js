var _     = require('underscore')
var Posts = Parse.Object.extend("Posts")

module.exports.home = function(req, res) {
  res.render("feed/index", {
    template: "feed/index"
  })
}

module.exports.posts = function(req, res) {
  var results = []
  var alreadySeen = req.session.feedPosts || []

  // Base "Or Query"
  var query = new Parse.Query(Posts)
  query.limit(10)

  query.equalTo("show", true)
  query.notContainedIn("objectId", alreadySeen)
  query.lessThanOrEqualTo("length", 200)
  query.descending("createdAt")

  query.find().then(function(posts) {
    var promise = Parse.Promise.as()

		_.each(posts, function(post) {
      promise = promise.then(function() {
        var image = post.get("image")

        if(alreadySeen.indexOf(post.id) == -1) {
          alreadySeen.push(post.id)
        }

        return results.push({
          message: post.get("flatContent"),
          image: (image) ? image.url() : "",
          background: post.get("background"),
          alpha: post.get("darkenerAlpha")
        })
      })
    })

    return promise
  }).then(function() {
    req.session.feedPosts = alreadySeen
    res.json(results)
  }, function(error) {
    console.log(error)
    res.json([])
  })
}
