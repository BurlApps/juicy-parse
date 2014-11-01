var Post = Parse.Object.extend("Posts")

Parse.Cloud.job("flatContent", function(req, res) {
  var query = new Parse.Query(Post)

  query.doesNotExist("flatContent")
  query.select(["content"])

  query.each(function(post) {
    post.set("flatContent", post.get("content").map(function(block) {
      return block.message
    }).join(""))

    return post.save()
  }).then(function() {
    res.success()
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
