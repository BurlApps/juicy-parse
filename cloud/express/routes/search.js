var Posts  = Parse.Object.extend("Posts")
var Moment = require("moment")
var _      = require('underscore')

module.exports.home = function(req, res) {
  res.render("search/index", {
	  template: 'search/index'
  })
}

module.exports.search = function(req, res) {
  var results = []
  var query = new Parse.Query(Posts)
  var now = new Date()
  var search = req.param("search")

	if(search) {
		query.matches("flatContent", new RegExp(search, "i"))
	}

	if(!req.session.user) {
  	query.equalTo("show", true)
  }

	query.exists("confession")
	query.descending("createdAt")
	query.limit(10)

  query.find().then(function(posts) {
  	var promise = Parse.Promise.as()

		_.each(posts, function(post) {
			promise = promise.then(function() {
		    var image = post.get("image")
				var queue = post.get("confession")

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
			      source: queue.get("source")
			    }

					if(school && facebookPost) {
						data["facebook"] = [
							"https://facebook.com/",
							school.get("facebookPage"),
							"/posts/",
							queue.get("facebookPost")
						].join("")
					}

			    return results.push(data)
			  })
		  })
	  })

	  return promise
  }).then(function() {
    res.json(results)
  }, function(error) {
    console.log(error)
    res.json([])
  })
}
