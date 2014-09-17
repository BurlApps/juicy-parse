var Image    = require("parse-image")
var Settings = require("cloud/util/settings")
var Post     = Parse.Object.extend("Posts")
var _        = require('underscore')

Parse.Cloud.job("seedPosts", function(req, res) {
  var number = req.params.posts

  Settings().then(function(settings) {
    var host = settings.get("host")

    return [
      "http://" + host + "/images/posts/420.jpg",
      "http://" + host + "/images/posts/face.png",
      "http://" + host + "/images/posts/keg.png",
      "http://" + host + "/images/posts/stance.jpg"
    ]
  }).then(function(images) {
    var promise = Parse.Promise.as()

    _(number).times(function(n) {
      promise = Parse.Cloud.httpRequest({
        url: images[Math.floor(Math.random() * images.length)]
      }).then(function(response) {
        return new Parse.File("image.jpg",  {
          base64: response.buffer.toString('base64')
        })
      }).then(function(image) {
        image.save()
        return image
      }).then(function(image) {
        var post = new Post()

        post.set("seeded", true)
        post.set("image", image)
        post.set("content", [{
          color: false,
          message: "Wow!! That is crazy!"
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
