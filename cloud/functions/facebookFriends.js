var _ = require('underscore')

Parse.Cloud.define("facebookFriends", function(req, res) {
  Parse.Cloud.useMasterKey()

  var currentUser     = Parse.User.current()
  var friendsRelation = currentUser.relation("friends")
  var names           = []

  Parse.Cloud.httpRequest({
    url:'https://graph.facebook.com/me/friends?&access_token=' + currentUser.get('authData').facebook.access_token
  }).then(function(response) {
    var promise = Parse.Promise.as()

    _.each(response.data.data, function(user) {
      promise = promise.then(function() {
        return names.push(user.name)
      })
    })

    return promise;
  }).then(function() {
    var query = new Parse.Query(Parse.User)
    query.containedIn("name", names)
    query.each(function(user) {
      friendsRelation.add(user)

      var userRelation = user.relation("friends")
      userRelation.add(currentUser)
      return user.save()
    }).then(function() {
      return currentUser.save()
    }).then(function() {
      res.success("Added facebook friends successfully")
    }, function(error) {
      res.error(error.message)
    })
  })
})
