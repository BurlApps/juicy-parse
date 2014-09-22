var Posts  = Parse.Object.extend("Posts")
var Queue  = Parse.Object.extend("ConfessionsQueue")
var Settings = require("cloud/util/settings")

module.exports.home = function(req, res) {
  res.render('confession')
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

    post.set("background", Settings.getBackground(settings))
    post.set("confession", true)
    post.set("content", [{
      color: false,
      message: message
    }])

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
