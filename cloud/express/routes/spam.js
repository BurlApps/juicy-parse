var Schools = Parse.Object.extend("Schools")
var Queue = Parse.Object.extend("ConfessionsQueue")
var Moment = require("moment")

module.exports.home = function(req, res) {
  var slug = req.param("school")

  if(slug) {
    var query = new Parse.Query(Schools)

    query.equalTo("slug", slug)
    query.first().then(function(school) {
      res.render("moderator/spam", {
        school: {
          id: school.id,
          slug: slug,
          name: school.get("name")
        },
        template: 'moderator/spam'
      })
    }, function(error) {
      console.log(error)
      res.redirect("/moderator/spam")
    })
  } else {
    res.render("moderator/spam", {
	    template: 'moderator/spam'
    })
  }
}

module.exports.confessions = function(req, res) {
  var confessions = []
  var query = new Parse.Query(Queue)
  var now = new Date()

  if(req.param("school")) {
    var school = new Schools()
    school.id = req.param("school")

    query.equalTo("school", school)
  }

  query.equalTo("show", false)
  query.equalTo("spam", true)

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
      return a.created > b.created
    }))
  }, function(error) {
    console.log(error)
    res.json([])
  })
}

module.exports.revert = function(req, res) {
  var queue = new Queue()
  queue.id = req.param("id")

  queue.fetch().then(function(queue) {
    var post = queue.get("post")

    return post.fetch().then(function(post) {
      post.set("show", true)
      return post.save()
    })
  }).then(function() {
    var user = new Parse.User()
    user.id = req.session.user

    queue.set("reverter", user)
    queue.set("show", true)
    queue.set("spam", false)

    return queue.save()
  }).then(function() {
    res.json({sucess: true})
  }, function(error) {
    console.log(error)
    res.json({sucess: false})
  })
}
