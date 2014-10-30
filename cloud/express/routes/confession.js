var Users  = Parse.Object.extend("User")
var Posts  = Parse.Object.extend("Posts")
var Queue  = Parse.Object.extend("ConfessionsQueue")
var Schools = Parse.Object.extend("Schools")
var Settings = require("cloud/util/settings")
var Image = require("parse-image")

module.exports.redirect = function(req, res) {
  Settings().then(function(settings) {
    res.redirect('/confession/' + (req.param("school") || settings.get("schoolsDefault")))
  })
}

module.exports.home = function(req, res) {
  var slug = req.param("school")

  if(slug) {
    var query = new Parse.Query(Schools)

    query.equalTo("slug", slug)
    query.first().then(function(school) {
      if(school) {
	      Settings().then(function(settings) {
	        res.render("confession", {
	          school: {
	            id: school.id,
	            slug: slug,
	            name: school.get("name")
	          },
	          admin: !!req.session.user,
	          imagesAllowed: settings.get("confessionsImagesAllowed")
	        })
	    	})
      } else {
        res.redirect("/confession")
      }
    }, function(error) {
      console.log(error)
      res.redirect("/confession")
    })
  } else {
    res.redirect("/confession")
  }
}

module.exports.post = function(req, res) {
  var message = req.param("message")
  var imageLink = req.param("image")
  var settings

  if(!message) {
    return res.json({
      success: false,
      message: "Confession missing :("
    })
  }

  Settings().then(function(settings) {
  	var user = new Parse.User()
  	req.settings = settings

  	if(req.session.user) {
      user.id = req.session.user
			return user
    } else if(req.cookies[settings.get("confessionTracker")]) {
      user.id = req.cookies[settings.get("confessionTracker")]
      return user
    } else {
	    var random = Math.random().toString(36).slice(2)
	    user.set("username", random)
	    user.set("password", random)
	    user.set("admin", false)
	    user.set("registered", false)
	    user.set("terms", false)
	    return user.signUp()
    }
  }).then(function(user) {
    var post = new Posts()
    var queue = new Queue()
    var school = new Schools()

    res.cookie(req.settings.get("confessionTracker"), user.id, {
	    maxAge: 9000000000,
	    httpOnly: true
	  })

    queue.set("creator", user)
    post.set("creator", user)

		post.set("darkenerAlpha", 1)
    post.set("background", Settings.getBackground(req.settings))
    post.set("confession", true)
    post.set("show", false)
    post.set("content", [{
      color: false,
      message: message
    }])

    school.id = req.param("school")

    queue.set("school", school)
    queue.set("source", "web")
    queue.set("post", post)
    queue.save()

		if(imageLink) {
			return Parse.Cloud.httpRequest({
				url: imageLink
			}).then(function(response) {
			  var image = new Image()
			  return image.setData(response.buffer)
			}).then(function(image) {
			  return image.data()
			}).then(function(buffer) {
				var linkParts = imageLink.split(".")
				var extension = linkParts[linkParts.length - 1].toLowerCase()

				if(["jpeg", "jpg", "png", "svg", "gif", "bmp"].indexOf(extension) == -1) {
					extension == "jpg"
				}

			  var file = new Parse.File("image." + extension, {
					base64: buffer.toString("base64")
				})

			  return file.save()
			}).then(function(image) {
				post.set("image", image)
				return post.save()
			})
		} else {
			return post.save()
		}
  }).then(function() {
    res.json({
      success: true,
      message: "Thanks for confessing :)"
    })
  }, function(error) {
	  console.log(error)

    res.json({
      success: false,
      message: "Something went wrong, sorry :("
    })
  })
}
