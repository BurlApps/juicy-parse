var Users = Parse.User
var Queue = Parse.Object.extend("ConfessionsQueue")
var Facebook = require("cloud/util/facebook")

module.exports.auth = function(req, res, next) {
  var emails = {}
  var query = new Parse.Query(Users)

  query.equalTo("admin", true)
  query.each(function(user) {
    date = user.get("birthday")

    month = date.getMonth() + 1
    month = (month < 10) ? ("0" + month) : month
    day = date.getDate()
    day = (day < 10) ? ("0" + day) : day
    year = date.getFullYear().toString().slice(-2)

    emails[user.get("email")] = {
      id: user.id,
      birthday: [month, day, year].join("")
    }
  }).then(function() {
    req.basicAuth(function(email, birthday) {
      var user = emails[email]
      var validUser = (user.birthday == birthday)

      if(validUser) {
        req.session.user = user.id
      }

      return validUser
    })(req, res, next)
  })
}


module.exports.home = function(req, res) {
  res.render("moderator")
}

module.exports.confessions = function(req, res) {
  var confessions = []
  var query = new Parse.Query(Queue)

  query.equalTo("show", true)
  query.equalTo("spam", false)

  query.each(function(confession) {
    var post = confession.get("post")
    var now  = new Date()

    return post.fetch().then(function(post) {
      return confessions.push({
        id: confession.id,
        message: post.get("content").map(function(block) {
          return block.message
        }).join(""),
        adminNote: post.get("adminNote") || "",
        source: confession.get("source"),
        created: confession.createdAt,
        now: now
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

module.exports.post = function(req, res, next) {
  var adminNote = req.param("adminNote")
  var message = req.param("message")
  var fbMessage = '"' + message + '"'

  if(adminNote) {
    fbMessage += "\n\nAdmin note: " + adminNote
  }

  Facebook.post(fbMessage).then(function() {
    var queue = new Queue()
    queue.id = req.param("id")

    return queue.fetch().then(function(queue) {
      var post = queue.get("post")

      return post.fetch().then(function(post) {
        var postMessage = post.get("content").map(function(block) {
          return block.message
        }).join("")

        if(message != postMessage) {
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

      queue.set("poster", user)
      queue.set("adminNote", adminNote || undefined)
      queue.set("show", false)
      queue.set("spam", false)
      return queue.save()
    })
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

    queue.set("deleter", user)
    queue.set("show", false)

    if(req.spam == true) {
      queue.set("spammer", user)
      queue.set("spam", true)
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
