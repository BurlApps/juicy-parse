var _ = require('underscore')
var Posts = Parse.Object.extend("Posts")

Parse.Cloud.job("hidePosts", function(req, res) {
  var countQuery = new Parse.Query(Posts)
  var daysAgo = new Date()

  daysAgo.setDate(daysAgo.getDate()-2)

  countQuery.count().then(function(count) {
    return Math.ceil(count/8)
  }).then(function(removeSkip) {
  	var query = new Parse.Query(Posts)

  	query.ascending("karma")
  	query.greaterThanOrEqualTo('updatedAt', daysAgo)
  	query.skip(removeSkip)
  	query.select(["karma"])

  	return query.first().then(function(post) {
	  	return post.get("karma")
  	})
  }).then(function(karma) {
    var query = new Parse.Query(Posts)

    query.greaterThanOrEqualTo('updatedAt', daysAgo)
    query.lessThanOrEqualTo("karma", karma)
    query.equalTo("show", true)
    query.select(["juicy", "show"])

    return query.each(function(post) {
      post.set("juicy", false)
      post.set("show", false)
      return post.save()
    })
  }).then(function() {
    res.success("")
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
