var Users = Parse.User
var Queue = Parse.Object.extend("ConfessionsQueue")

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

    emails[user.get("email")] = [month, day, year].join("")
  }).then(function() {
    req.basicAuth(function(email, birthday) {
      return emails[email] == birthday
    })(req, res, next)
  })
}


module.exports.home = function(req, res) {
  res.render("spam")
}

module.exports.confessions = function(req, res) {
  var confessions = []
  var query = new Parse.Query(Queue)

  query.equalTo("show", false)
  query.equalTo("spam", true)

  query.each(function(confession) {
    var post = confession.get("post")
    var now  = new Date()

    return post.fetch().then(function(post) {
      return confessions.push({
        id: confession.id,
        message: post.get("content")[0].message,
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

module.exports.revert = function(req, res) {
  var queue = new Queue()
  queue.id = req.param("id")
  console.log(queue.id)

  queue.fetch().then(function(queue) {
    var post = queue.get("post")

    return post.fetch().then(function(post) {
      post.set("show", true)
      return post.save()
    })
  }).then(function() {
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
