var Users = Parse.User
var Queue = Parse.Object.extend("ConfessionsQueue")
var Schools = Parse.Object.extend("Schools")
var Facebook = require("cloud/util/facebook")
var Moment = require("moment")

module.exports.auth = function(req, res, next) {
	if(req.session.user) {
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

module.exports.login = function(req, res, next) {
	Parse.User.logIn(req.param("email"), req.param("password"), {
	  success: function(user) {
		  if(user.get("moderator") == true) {
		  	var schoolsQuery = user.relation("schools").query()
		  	var schools = []

        schoolsQuery.each(function(school) {
          return schools.push({
            id: school.id,
            name: school.get("name"),
            slug: school.get("slug")
          })
        }).then(function() {
          req.session.schools = schools
          req.session.user = user.id
          req.session.admin = user.get("admin")

          res.json({
  			  	success: true
  		  	})
        })
		  } else {
			  res.json({
			  	success: false,
			  	message: "Invalid credentials :("
		  	})
		  }
	  },
	  error: function(user, error) {
		  console.log(error)

	    res.json({
		  	success: false,
		  	message: "Invalid credentials :("
	  	})
	  }
	})
}

module.exports.logout = function(req, res, next) {
	req.session = null
	res.redirect("/")
}

module.exports.home = function(req, res) {
  var slug = req.param("school")
  var schools = req.session.schools
  var allowed = (schools.map(function(school) {
    return school.slug
  }).indexOf(slug) != -1)

  if(slug) {
    if(allowed) {
      var query = new Parse.Query(Schools)

      query.equalTo("slug", slug)
      query.first().then(function(school) {
        if(school) {
          res.render("moderator/index", {
            school: {
              id: school.id,
              slug: slug,
              name: school.get("name"),
            },
            template: 'moderator/index'
          })
        } else {
          res.redirect("/moderator")
        }
      }, function(error) {
        console.log(error)
        res.redirect("/moderator")
      })
    } else {
      res.redirect("/moderator")
    }
  } else {
    res.render("moderator/index", {
	    template: 'moderator/index'
    })
  }
}

module.exports.confessions = function(req, res) {
  var confessions = []
  var query = new Parse.Query(Queue)
  var now = new Date()
  var user = new Users()

  user.id = req.session.user

  user.fetch().then(function() {
    if(req.param("school")) {
      var school = new Schools()
      school.id = req.param("school")

      query.equalTo("school", school)
    } else {
      query.matchesQuery("school", user.relation("schools").query())
    }

    query.equalTo("show", true)
    query.equalTo("spam", false)

    query.each(function(confession) {
      var post = confession.get("post")
      var school = confession.get("school")
      var object = {}

      if(!post) {
         return false
      }

      return post.fetch().then(function(post) {
  	    var image = post.get("image")

        return object = {
          id: confession.id,
          post: post.id,
          message: post.get("flatContent"),
          image: (image) ? image.url() : null,
          created: post.createdAt,
          adminNote: confession.get("adminNote") || "",
          source: confession.get("source"),
          duration: Moment.duration(post.createdAt - now).humanize(true)
        }
      }).then(function() {
        if(school) {
          return school.fetch().then(function(school) {
            return object.school = {
              id: school.id,
              name: school.get("name")
            }
          })
        } else {
          return object.school = null
        }
      }).then(function() {
        confessions.push(object)
      })
    }).then(function() {
      res.json(confessions.sort(function(a, b) {
        return a.created - b.created
      }))
    }, function(error) {
      console.log(error)
      res.json([])
    })
  })
}

module.exports.post = function(req, res, next) {
  var adminNote = req.param("adminNote")
  var message = req.param("message")
  var hasImage = req.param("image")
  var fbMessage = '"' + message + '"'
  var fbLink = null
  var queue = new Queue()
  queue.id = req.param("id")

  if(hasImage == "true") {
	  fbLink = [
	  	"\nhttp://", req.host,
	  	"/images/", req.param("post")
	  ].join("")
	  fbMessage += fbLink
  }

  if(adminNote != "") {
    fbMessage += "\n\nAdmin note: " + adminNote
  }

  queue.fetch().then(function() {
    var school = queue.get("school")
    var poster = queue.get("poster")
    var show = queue.get("show")
    var spam = queue.get("spam")

    if(school && !poster && show && !spam) {
      return Facebook.post(fbMessage, fbLink, school).then(function(postID) {
	      queue.set("facebookPost", postID)
      })
    } else if(poster) {
    	queue.set("show", false)
	    queue.set("spam", false)
	    queue.save()
	    return Parse.Promise.error("Already posted to facebook")
    } else if(!show || spam) {
      return Parse.Promise.error("Marked as hidden or spam already")
    } else {
      return true
    }
  }).then(function() {
    var post = queue.get("post")

    return post.fetch().then(function(post) {
      if(message != post.get("flatContent")) {
        post.set("content", [{
          color: false,
          message: message
        }])
      }

      post.set("show", true)
      return post.save()
    })
  }).then(function() {
    var user = new Parse.User()
    user.id = req.session.user

    if(adminNote) {
      queue.set("adminNote", adminNote)
    }

    queue.set("poster", user)
    queue.set("show", false)
    queue.set("spam", false)
    return queue.save()
  }).then(function() {
    res.json({sucess: true})
  }, function(error) {
    console.log(error)
    res.json({sucess: false})
  })
}

module.exports.delete = function(req, res) {
  var queue = new Queue()
  queue.id = req.param("id")

  queue.fetch().then(function(queue) {
    var post = queue.get("post")

    return post.fetch().then(function(post) {
      post.set("show", false)
      return post.save()
    })
  }).then(function() {
    var user = new Parse.User()
    user.id = req.session.user

    queue.set("show", false)

    if(req.spam == true) {
      queue.set("spammer", user)
      queue.set("spam", true)
    } else {
    	queue.set("deleter", user)
	    queue.set("spam", false)
    }

    return queue.save()
  }).then(function() {
    res.json({sucess: true})
  }, function(error) {
    console.log(error)
    res.json({sucess: false})
  })
}

module.exports.spam = function(req, res, next) {
  req.spam = true
  next()
}
