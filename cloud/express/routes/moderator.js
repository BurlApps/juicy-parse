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
    year = date.getFullYear().toString().slice(-2)

    emails[user.get("email")] = [month, day, year].join("")
  }).then(function() {
    req.basicAuth(function(email, birthday) {
      return emails[email] == birthday
    })(req, res, next)
  })
}


module.exports.home = function(req, res) {
  res.render("moderator")
}

module.exports.confessions = function(req, res) {
  var confessions = []
  var query = new Parse.Query(Queue)

  query.limit = 50;

  query.each(function(confession) {
    var post = confession.get("post")

    return post.fetch().then(function(post) {
      return confessions.push({
        id: confession.id,
        message: post.get("content")[0].message
      })
    })
  }).then(function() {
    res.json(confessions)
  }, function(error) {
    console.log(error)
    res.json([])
  })
}

module.exports.post = function(req, res) {
  Facebook.post(req.param("message")).then(function() {
    module.exports.delete(req, res)
  }, function(error) {
    console.log(error)
    res.json({sucess: false})
  })
}

module.exports.delete = function(req, res) {
  var queue = new Queue()
  queue.id = req.param("id")

  queue.destroy().then(function() {
    res.json({sucess: true})
  }, function(error) {
    console.log(error)
    res.json({sucess: false})
  })
}
