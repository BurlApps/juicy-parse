var Users = Parse.User
var Schools = Parse.Object.extend("Schools")

module.exports.auth = function(req, res, next) {
	if(req.session.admin) {
		next();
	} else if(req.xhr) {
		res.json({
			success: false,
			message: "Login required :("
		})
	} else {
		res.render("moderator/login", {
			template: "moderator/login"
		})
	}
}

module.exports.home = function(req, res) {
  var query = new Parse.Query(Users)
  var moderators = []

  query.equalTo("moderator", true)

  query.each(function(user) {
    var schoolsQuery = user.relation("schools").query()
    var schools = []

    return schoolsQuery.each(function(school) {
      return schools.push(school.id)
    }).then(function() {
      return moderators.push({
        id: user.id,
        name: user.get("name"),
        schools: schools
      })
    })
  }).then(function() {
    res.render("moderators/index", {
      moderators: moderators,
      template: 'moderators/index'
    })
  })
}

module.exports.school = function(req, res) {
  var query = new Parse.Query(Users)
  var school = new Schools()

  school.id = req.param("school")

  query.get(req.param("user")).then(function(user) {
    var schools = user.relation("schools")

    if(req.param("allowed") == "on") {
      schools.add(school)
    } else {
      schools.remove(school)
    }

    return user.save()
  }).then(function() {
    res.json({
      success: true
    })
  }, function(error) {
    console.error(error)

    res.json({
      success: false,
      message: "Failed to update school permission"
    })
  })
}
