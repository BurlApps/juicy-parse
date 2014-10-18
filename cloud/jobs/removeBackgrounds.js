var Posts = Parse.Object.extend("Posts")
var Settings = require("cloud/util/settings")

Parse.Cloud.job("removeBackgrounds", function(req, res) {
  Settings().then(function(settings) {
	  var query = new Parse.Query(Posts)

	  query.exists("image")
	  query.each(function(post) {
			post.unset("image")
			post.set("background", Settings.getBackground(settings))

			return post.save()
	  }).then(function() {
	    res.success("")
	  }, function(error) {
	    res.error(error.message)
	  })
	})
})
