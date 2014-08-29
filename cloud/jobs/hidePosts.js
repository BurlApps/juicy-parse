var _ = require('underscore');

Parse.Cloud.job("hidePosts", function(req, res) {
  var postsObject = Parse.Object.extend("Posts")
  var countQuery  = new Parse.Query(postsObject)

  countQuery.equalTo("show", true)
  countQuery.count().then(function(count) {
    return Math.ceil(count/4)
  }).then(function(removeLimit) {
    var query = new Parse.Query(postsObject)
    var promise = Parse.Promise.as()

    var oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate()-1)

    query.greaterThanOrEqualTo('updatedAt', oneDayAgo)
    query.equalTo("show", true)
    query.ascending("karma")
    query.limit(removeLimit)

    query.find(function(posts) {
      _.each(posts, function(post) {
        promise.then(function() {
          post.set("juicy", false)
          post.set("show", false)
          return post.save()
        })
      })
    })

    return promise
  }).then(function() {
    res.success()
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
