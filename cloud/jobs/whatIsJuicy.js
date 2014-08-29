var _ = require('underscore');

Parse.Cloud.job("whatIsJuicy", function(req, res) {
  var postsObject = Parse.Object.extend("Posts")
  var oneDayQuery = new Parse.Query(postsObject)

  var oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate()-1)
  oneDayQuery.greaterThanOrEqualTo('updatedAt', oneDayAgo)
  oneDayQuery.descending("karma")
  oneDayQuery.skip(10)
  oneDayQuery.limit(1)

  oneDayQuery.first().then(function(post) {
    return post.get("karma")
  }).then(function(topPercent) {
    var topQuery = new Parse.Query(postsObject)
    topQuery.greaterThanOrEqualTo('karma', topPercent)

    topQuery.each(function(post) {
      post.set("juicy", true)
      return post.save()
    })

    return topPercent
  }).then(function(topPercent) {
    var bottomQuery = new Parse.Query(postsObject)
    bottomQuery.lessThan('karma', topPercent)

    return bottomQuery.each(function(post) {
      post.set("juicy", false)
      return post.save()
    })
  }).then(function() {
    res.success()
  }, function(error) {
    res.error(error.message)
  })
})
