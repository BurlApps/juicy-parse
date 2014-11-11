var Posts = Parse.Object.extend("Posts")

Parse.Cloud.define("topPosts", function(req, res) {
  var query = new Parse.Query(Posts)
  var daysAgo = new Date()

  daysAgo.setDate(daysAgo.getDate() - 2)

  query.limit(req.params.limit)
  query.equalTo("show", true)
  query.descending("karma")
  query.lessThanOrEqualTo("createdAt", daysAgo)

  query.find().then(function(posts) {
    res.success(posts)
  }, function(error) {
    res.error(error.description)
  })
})
