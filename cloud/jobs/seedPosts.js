var demoUser = require("cloud/util/getDemoUser")
var Image    = require("parse-image");
var _        = require('underscore');

Parse.Cloud.job("seedPosts", function(req, res) {
  var number = req.params.posts
  demoUser(function(user) {
    var Post   = Parse.Object.extend("Posts")
    var images = [
      "http://www.heykiki.com/blog/wp-content/uploads/2013/09/a49.jpg",
      "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg",
      "http://cdn.surf.transworld.net/wp-content/blogs.dir/443/files/2013/08/Vans-Party.jpg",
      "http://norwich.tab.co.uk/files/2012/10/house-party21.jpg",
      "http://cdn.lipstiq.com/wp-content/uploads/2014/02/cover3.jpg",
      "http://static6.businessinsider.com/image/51f0432069beddd20a000004/email-ad-exec-demands-free-food-for-90-people-at-a-going-away-party.jpg"
    ]

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
        var aboutRelation = post.relation("aboutUsers")

        aboutRelation.add(user)

        post.set("likes", 0)
        post.set("karma", 0)
        post.set("juicy", false)
	post.set("show", true)
        post.set("creator", user)
        post.set("image", image)
        post.set("content", [{
          color: false,
          message: "Wow!! That is crazy "
        }, {
          color: true,
          message: user.get("displayName")
        }, {
          color: false,
          message: "! What were you thinking?\n"
        }, {
          color: false,
          message: "Post: #" + n
        }])

        return post.save()
      })
    })

    promise.then(function() {
      res.success()
    }, function(error) {
      res.error(error.message)
    })
  }, function(error) {
    res.error(error.message)
  })
})
