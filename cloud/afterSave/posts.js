var Queue = Parse.Object.extend("ConfessionsQueue")

Parse.Cloud.afterSave("Posts", function(req, res) {
  var post = req.object
  var queue = new Queue()

  if(post.existed()) {
    return res.success()
  }

  // Add To Queue
  if(!post.get("confession")) {
    queue.set("source", "app")
    queue.set("post", post)
    queue.save()
  }
})
