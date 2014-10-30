var Post = Parse.Object.extend("Posts")

module.exports.home = function(req, res) {
  var post = new Post()
  post.id = req.param("post")

  post.fetch().then(function() {
	  var image = post.get("image")
	  res.redirect((image) ? image.url() : "")
  }, function() {
	  res.redirect("/")
  })
}
