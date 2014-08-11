Parse.Cloud.define("seedPosts", function(req, res) {
  var Post = Parse.Object.extend("Posts")
  var user = Parse.User.current()

  Parse.Cloud.httpRequest({
    url: "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg"
  }).then(function(imageData) {
    var image = new Parse.File("background.jpg",  {
      base64: imageData.buffer.toString('base64')
    })

    image.save().then(function() {
      for(var i=0; i<5; i++) {
        var post = new Post()
        var relation = post.relation("aboutUsers")

        relation.add(user)
        post.set("likes", Math.floor((Math.random() * 100) + 1))
        post.set("juicy", i%4 == 0)
        post.set("creator", user)
        post.set("image", image)
        post.save()
      }
    }, res.error)
  }, res.error)
})
