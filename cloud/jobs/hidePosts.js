Parse.Cloud.job("hidePosts", function(req, res) {
  var postsObject = Parse.Object.extend("Posts")
  var countQuery  = new Parse.Query(postsObject)

  countQuery.equalTo("show", true)
  countQuery.count().then(function(count) {
    return Math.ceil(count/4)
  }).then(function(removeLimit) {
    var query = new Parse.Query(postsObject)

    query.equalTo("show", true)
    query.ascending("karma")
    query.limit(removeLimit)

    return query.each(function(post) {
      post.set("juicy", false)
      post.set("show", false)
      return post.save()
    })
  }).then(function() {
    res.success()
  }, function(error) {
    res.error(error.message)
  })
})
