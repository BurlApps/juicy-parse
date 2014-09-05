var Posts  = Parse.Object.extend("Posts")
var Queue  = Parse.Object.extend("ConfessionsQueue")
var images = [
  "http://www.heykiki.com/blog/wp-content/uploads/2013/09/a49.jpg",
  "http://www.wired.com/images_blogs/underwire/2013/01/mf_ddp_large.jpg",
  "http://cdn.surf.transworld.net/wp-content/blogs.dir/443/files/2013/08/Vans-Party.jpg",
  "http://norwich.tab.co.uk/files/2012/10/house-party21.jpg",
  "http://cdn.lipstiq.com/wp-content/uploads/2014/02/cover3.jpg",
  "http://static6.businessinsider.com/image/51f0432069beddd20a000004/email-ad-exec-demands-free-food-for-90-people-at-a-going-away-party.jpg"
]

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

  Parse.Cloud.httpRequest({
    url: images[Math.floor(Math.random() * images.length)]
  }).then(function(response) {
    return new Parse.File("image.jpg",  {
      base64: response.buffer.toString('base64')
    })
  }).then(function(image) {
    image.save()
    return image
  }).then(function(image) {
    var post = new Posts()
    var queue = new Queue()

    post.set("confession", true)
    post.set("image", image)
    post.set("content", [{
      color: false,
      message: message
    }])

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
