Parse.Cloud.beforeSave("ConfessionsQueue", function(req, res) {
  var queue = req.object

  if(!queue.isNew()) {
    return res.success()
  }

  // Set Defaults
  queue.set("show", true)
  res.success()
})
