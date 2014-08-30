Parse.Cloud.beforeSave(Parse.User, function(req, res) {
  Parse.Cloud.useMasterKey();
  var user = req.object

  if(!user.isNew()) {
    return res.success()
  }

  // Set Defaults
  user.set("admin", !!user.get("admin"))
  user.set("terms", !!user.get("terms"))
  user.set("registered", !!user.get("registered"))
  user.set("displayName", user.get("name"))
  res.success()
})
