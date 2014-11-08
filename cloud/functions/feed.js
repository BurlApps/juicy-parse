var Users = Parse.User
var Posts = Parse.Object.extend("Posts")
var Shuffle = require("cloud/util/shuffle")

Parse.Cloud.define("feed", function(req, res) {
  // TODO: All queries below are part of compound "or query"
  // TODO: Query for friends that have liked it (done)
  // TODO: Query for geo location from where u are
  // TODO: Query for about my friends (done)
  // TODO: Query for about me (done)
  // TODO: Query for hotness calculated by karma (done)
  // TODO: Query for newest posts (done)

  var currentUser = Parse.User.current()

	// Geo Query
	var geoQuery = new Parse.Query(Posts)
	geoQuery.equalTo("city", req.params.city)

	if(!req.params.city) {
		geoQuery.limit(0)
	}

  // New Posts Query
  var daysAgo = new Date()
  var newPostsQuery = new Parse.Query(Posts)

  daysAgo.setDate(daysAgo.getDate() - 5 - req.params.skip)
  newPostsQuery.greaterThanOrEqualTo("updatedAt", daysAgo)

  // About Me Query
  var aboutMeQuery = new Parse.Query(Posts)
  aboutMeQuery.equalTo("aboutUsers", currentUser)

  // About My Friends Query
  var aboutFriendsQuery = new Parse.Query(Posts)
  var friendRelation = currentUser.relation("friends")
  aboutFriendsQuery.matchesQuery("aboutUsers", friendRelation.query())

  // Base "Or Query"
  var query = Parse.Query.or(geoQuery, aboutMeQuery, aboutFriendsQuery, newPostsQuery)
  query.limit(req.params.limit)
  query.skip(req.params.skip)

  query.equalTo("show", true)
  query.lessThanOrEqualTo("length", 200)
  query.notEqualTo("creator", currentUser)
  query.notEqualTo("likedUsers", currentUser)
  query.notEqualTo("nopedUsers", currentUser)
  query.descending("createdAt")

  query.find().then(function(posts) {
    res.success(Shuffle(posts))
  }, function(error) {
    res.error(error.description)
  })
})
