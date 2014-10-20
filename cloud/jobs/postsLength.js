var Post = Parse.Object.extend("Posts")

Parse.Cloud.job("postsLength", function(req, res) {
  var query = new Parse.Query(Post)

  query.doesNotExist("length")

  query.each(function(post) {
  	var content = post.get("flatContent")
    post.set("length", content.length)

    return post.save()
  }).then(function() {
    res.success()
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
