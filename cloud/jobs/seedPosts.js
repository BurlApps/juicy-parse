var Image    = require("parse-image")
var Settings = require("cloud/util/settings")
var Post     = Parse.Object.extend("Posts")
var _        = require('underscore')

Parse.Cloud.job("seedPosts", function(req, res) {
  var number = req.params.posts

  Settings().then(function(settings) {
    var promise = Parse.Promise.as()

    _(number).times(function(n) {
      promise = promise.then(function(image) {
        var post = new Post()

        post.set("background", Settings.getBackground(req.settings))
        post.set("seeded", true)
        post.set("content", [{
          color: false,
          message: "Wow!! That is crazy! "
        }, {
          color: false,
          message: "What were you thinking?\n"
        }, {
          color: false,
          message: "Post: #" + n
        }])

        return post.save()
      })
    })

    return promise
  }).then(function() {
    res.success()
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
