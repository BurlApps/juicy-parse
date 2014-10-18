var Posts  = Parse.Object.extend("Posts")
var Moment = require("moment")
var _      = require('underscore')

module.exports.home = function(req, res) {
  res.render("search")
}

module.exports.search = function(req, res) {
  var results = []
  var query = new Parse.Query(Posts)
  var now = new Date()
  var search = req.param("search")

	if(search) {
		query.matches("flatContent", new RegExp(search, "i"))
	}

  query.equalTo("show", true)
	query.descending("createdAt")
	query.limit(20)

  query.find().then(function(posts) {
  	var promise = Parse.Promise.as()

		_.each(posts, function(post) {
			promise = promise.then(function() {
		    return results.push({
		      message: post.get("flatContent"),
		      duration: Moment.duration(post.createdAt - now).humanize(true)
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
