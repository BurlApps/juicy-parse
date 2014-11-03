var Post = Parse.Object.extend("Posts")
var Moment = require("moment")

module.exports.home = function(req, res) {
  var post = new Post()
  post.id = req.param("post")

  post.fetch().then(function() {
	  var image = post.get("image")
		var queue = post.get("confession")
		var now = new Date()

		if(!req.session.user && !post.get("show")) {
			return res.redirect("/")
		}

		return queue.fetch().then(function() {
			var school = queue.get("school")

			if(school) {
				return school.fetch()
			} else {
				return false
			}
		}).then(function(school) {
			var facebookPost = queue.get("facebookPost")
			var data = {
	      message: post.get("flatContent"),
	      image: (image) ? image.url() : null,
	      duration: Moment.duration(post.createdAt - now).humanize(true),
	      show: post.get("show"),
	      template: "posts/index"
	    }

			if(school && facebookPost) {
				data["facebook"] = [
					"https://facebook.com/",
					school.get("facebookPage"),
					"/posts/",
					queue.get("facebookPost")
				].join("")
			}

	    res.render("posts/index", data)
	  })
  }, function() {
	  res.redirect("/")
  })
}
