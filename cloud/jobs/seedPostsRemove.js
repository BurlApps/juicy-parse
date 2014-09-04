var Posts = Parse.Object.extend("Posts")

Parse.Cloud.job("seedPostsRemove", function(req, res) {
  var query = new Parse.Query(Posts)

  query.equalTo("seeded", true)

  query.each(function(post) {
    return post.destroy()
  }).then(function() {
    res.success("")
  }, function(error) {
    res.error(error.message)
  })
})
