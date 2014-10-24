var _ = require('underscore')

Parse.Cloud.define("facebookFriends", function(req, res) {
  Parse.Cloud.useMasterKey()

  var currentUser     = Parse.User.current()
  var friendsRelation = currentUser.relation("friends")
  var names           = []
  var users						= []

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
    var friendsQuery = new Parse.Query(Parse.User)
    friendsQuery.containedIn("name", names)
    friendsQuery.each(function(user) {
    	users.push(user)
      friendsRelation.add(user)

      var userRelation = user.relation("friends")
      userRelation.add(currentUser)

      return user.save()
    }).then(function() {
      return currentUser.save()
    }).then(function() {
	    var pushQuery = new Parse.Query(Parse.Installation);
			pushQuery.containedIn("user", users)

			return Parse.Push.send({
			  where: pushQuery,
			  data: {
			    alert: "Your friend just joined Juicy! Watch for new friend posts 😃",
			    badge: "Increment",
			    sound: "alert.caf"
			  }
			})
    }).then(function() {
      res.success("Added facebook friends successfully")
    }, function(error) {
      res.error(error.message)
    })
  })
})
