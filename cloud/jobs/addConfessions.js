var Posts = Parse.Object.extend("Posts")
var Queue = Parse.Object.extend("ConfessionsQueue")

Parse.Cloud.job("addConfessions", function(req, res) {
  var query = new Parse.Query(Posts)

  query.doesNotExist("confession")

  query.each(function(post) {
    var queueQuery = new Parse.Query(Queue)

		queueQuery.equalTo("post", post)
		return queueQuery.first().then(function(queue) {
			post.set("confession", queue)
			return post.save()
		})
  }).then(function() {
    res.success("")
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
