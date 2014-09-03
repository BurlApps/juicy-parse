var Testers = Parse.Object.extend("Testers")

Parse.Cloud.beforeSave(Parse.User, function(req, res) {
  Parse.Cloud.useMasterKey();
  var user = req.object

  if(user.isNew()) {
    user.set("admin", !!user.get("admin"))
    user.set("terms", !!user.get("terms"))
    user.set("registered", !!user.get("registered"))
    user.set("displayName", user.get("name"))
    res.success()
  } else if(user.dirty("email") && !user.get("displayName")) {
    var query = new Parse.Query(Testers)
    var name  = user.get("name")
    var email = user.get("email")

    user.set("displayName", name)

    // Check if Beta Tester
    query.equalTo("email", email)
    query.first().then(function(tester) {
      if(tester) {
        tester.set("name", name)
        tester.set("user", user)
        return tester.save()
      }
    }).then(function() {
      res.success()
    }, function(error) {
      res.error(error.message)
    })
  } else {
    res.success()
  }
})
