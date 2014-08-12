Parse.Cloud.define("seedPosts", function(req, res) {
  var Post = Parse.Object.extend("Posts")
  var user = Parse.User.current()
  var images = [
    "http://www.heykiki.com/blog/wp-content/uploads/2013/09/a49.jpg",
    "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg",
    "http://cdn.surf.transworld.net/wp-content/blogs.dir/443/files/2013/08/Vans-Party.jpg",
    "http://norwich.tab.co.uk/files/2012/10/house-party21.jpg",
    "http://cdn.lipstiq.com/wp-content/uploads/2014/02/cover3.jpg",
    "http://static6.businessinsider.com/image/51f0432069beddd20a000004/email-ad-exec-demands-free-food-for-90-people-at-a-going-away-party.jpg"
  ]

  for(var i=0; i<images.length; i++) {
    Parse.Cloud.httpRequest({
      url: images[i]
    }).then(function(imageData) {
      var image = new Parse.File("background.jpg",  {
        base64: imageData.buffer.toString('base64')
      })

      image.save().then(function() {
          var post = new Post()
          var relation = post.relation("aboutUsers")

          relation.add(user)
          post.set("likes", Math.floor((Math.random() * 100) + 1))
          post.set("juicy", [true, false][Math.round(Math.random())])
          post.set("creator", user)
          post.set("image", image)
          post.set("content", "Wow!! That is crazy Mard Abams!")
          post.save()
      }, res.error)
    }, res.error)
  }
})
