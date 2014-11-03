var Queue = Parse.Object.extend("ConfessionsQueue")

Parse.Cloud.afterSave("Posts", function(req, res) {
  var post = req.object

  if(post.existed()) return

  // Add To Queue: Posted in App
  if(!post.get("confession") && !post.get("seeded")) {
	  var queue = new Queue()

    queue.set("source", "app")
    queue.set("post", post)
    queue.set("creator", post.get("creator"))
    queue.save()

    post.set("confession", queue)
    return post.save()
  }
})
