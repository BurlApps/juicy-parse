var Schools = Parse.Object.extend("Schools")
var Queue = Parse.Object.extend("ConfessionsQueue")
var Moment = require("moment")

module.exports.home = function(req, res) {
  var slug = req.param("school")

  if(slug) {
    var query = new Parse.Query(Schools)

    query.equalTo("slug", slug)
    query.first().then(function(school) {
      res.render("spam", {
        school: school.id,
        slug: slug
      })
    }, function(error) {
      console.log(error)
      res.redirect("/moderator/spam")
    })
  } else {
    res.render("spam")
  }
}

module.exports.confessions = function(req, res) {
  var confessions = []
  var query = new Parse.Query(Queue)
  var now  = new Date()
  var schoolID = req.param("school")

  if(schoolID) {
    var school = new Schools()
    school.id = schoolID

    query.equalTo("school", school)
  } else {
    query.doesNotExist("school")
  }

  query.equalTo("show", false)
  query.equalTo("spam", true)

  query.each(function(confession) {
    var post = confession.get("post")

    return post.fetch().then(function(post) {
      return confessions.push({
        id: confession.id,
        message: post.get("content").map(function(block) {
          return block.message
        }).join(""),
        source: confession.get("source"),
        created: post.createdAt,
        duration: Moment.duration(post.createdAt - now).humanize(true)
      })
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
