var _     = require('underscore')
var Posts = Parse.Object.extend("Posts")

Parse.Cloud.job("seedPostsRemove", function(req, res) {
  var query = new Parse.Query(Posts)
  var amount = req.params.posts

  query.equalTo("seeded", true)

  if(amount == "all") {
    query.limit(1000)
  } else {
    query.limit(amount)
  }

  query.find().then(function(posts) {
    var promise = Parse.Promise.as()

    _.each(posts, function(post) {
      promise = promise.then(function() {
        return post.destroy()
      })
    })

    return promise
  }).then(function() {
    res.success("")
  }, function(error) {
    res.error(error.message)
  })
})
