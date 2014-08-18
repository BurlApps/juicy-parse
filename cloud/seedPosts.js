var demoUser = require("cloud/demoUser")
var Image = require("parse-image");

// Create Background Job
Parse.Cloud.job("seedPosts", function(req, res) {
  var number = req.params.posts
  demoUser(function(user) {
    var Post = Parse.Object.extend("Posts")
    var images = [
      "http://www.heykiki.com/blog/wp-content/uploads/2013/09/a49.jpg",
      "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg",
      "http://cdn.surf.transworld.net/wp-content/blogs.dir/443/files/2013/08/Vans-Party.jpg",
      "http://norwich.tab.co.uk/files/2012/10/house-party21.jpg",
      "http://cdn.lipstiq.com/wp-content/uploads/2014/02/cover3.jpg",
      "http://static6.businessinsider.com/image/51f0432069beddd20a000004/email-ad-exec-demands-free-food-for-90-people-at-a-going-away-party.jpg"
    ]

    for(var i=0; i<number; i++) {
      Parse.Cloud.httpRequest({
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
          var likedRelation = post.relation("likedUsers")
          var nopeRelation = post.relation("nopedUsers")

          aboutRelation.add(user)
          likedRelation.add(user)
          nopeRelation.add(user)

          post.set("likes", Math.floor((Math.random() * 100) + 1))
	  post.set("karma", Math.floor((Math.random() * 100) * (Math.random() < 0.5 ? -1 : 1)))
          post.set("juicy", (Math.random() > 0.9))
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
            message: "! What were you thinking? "
          }])
          return post.save()
      }).then(function(result) {
        if(i == (number - 1)) {
          res.success();
        }
      }, function(error) {
        res.error(error.message);
      });
    }
  }, function(error) {
    res.error(error.message);
  })
})
