var Queue = Parse.Object.extend("ConfessionsQueue")

Parse.Cloud.afterSave("Posts", function(req, res) {
  var post = req.object

  if(post.existed()) return

  // If Not A Confession or Seeded
  if(!post.get("confession") && !post.get("seeded")) {
	  //Add To Queue
	  var queue = new Queue()

    queue.set("source", "app")
    queue.set("post", post)
    queue.set("creator", post.get("creator"))
    queue.save()

    post.set("confession", queue)
    return post.save().then(function() {
      // Send Push Notification
      var user = post.get("creator")
      var friendsRelation = user.relation("friends")
      var pushQuery = new Parse.Query(Parse.Installation);
    	pushQuery.matchesQuery("user", friendsRelation.query())

      return Parse.Push.send({
    	  where: pushQuery,
    	  data: {
    	    alert: "Your friend just posted, check the feed! 😃",
    	    badge: "Increment",
    	    sound: "alert.caf"
    	  }
    	})
    })
  }
})
