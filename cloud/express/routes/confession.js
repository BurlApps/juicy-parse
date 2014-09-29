var Posts  = Parse.Object.extend("Posts")
var Queue  = Parse.Object.extend("ConfessionsQueue")
var Schools = Parse.Object.extend("Schools")
var Settings = require("cloud/util/settings")

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
        res.render("confession", {
          school: {
            id: school.id,
            slug: slug,
            name: school.get("name")
          },
          admin: !!req.session.user
        })
      } else {
        res.redirect("/confession")
      }
    }, function(error) {
      console.log(error)
      res.redirect("/confession", {
        admin: !!req.session.user
      })
    })
  } else {
    res.render("spam")
  }
}

module.exports.post = function(req, res) {
  var message = req.param("message")

  if(!message) {
    return res.json({
      success: false,
      message: "Confession missing :("
    })
  }

  Settings().then(function(settings) {
    var post = new Posts()
    var queue = new Queue()
    var school = new Schools()

    if(req.session.user) {
      var user = new Parse.User()
      user.id = req.session.user
      queue.set("creator", user)
      post.set("creator", user)
    }

    post.set("background", Settings.getBackground(settings))
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

    return post.save()
  }).then(function() {
    res.json({
      success: true,
      message: "Thanks for confessing :)"
    })
  }, function() {
    res.json({
      success: false,
      message: "Something went wrong, sorry :("
    })
  })
}
