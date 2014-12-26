Parse.Cloud.beforeSave("ConfessionsQueue", function(req, res) {
  var queue = req.object

  if(!queue.isNew()) {
    return res.success()
  }

  // Set Defaults
  if(queue.get("show") == null) {
    queue.set("show", true)
  }

  queue.set("spam", false)
  res.success()
})
