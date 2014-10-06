var Image = require("parse-image")

Parse.Cloud.beforeSave("Posts", function(req, res) {
  var post = req.object

  post.set("flatContent", post.get("content").map(function(block) {
    return block.message
  }).join(""))

  if(!post.isNew()) return res.success()

  // Set Defaults
  post.set("shares", 0)
  post.set("likes", 0)
  post.set("karma", 0)
  post.set("juicy", false)
  post.set("show", !!post.get("show"))
  post.set("seeded", !!post.get("seeded"))
  post.set("confession", !!post.get("confession"))

  // Resize Image
  if(post.get("image")) {
    Parse.Cloud.httpRequest({
      url: post.get("image").url()
    }).then(function(data) {
      var image = new Image()
      return image.setData(data.buffer)
    }).then(function(image) {
      // Crop the image to the smaller of width or height.
      var size = Math.min(image.width(), image.height())
      return image.crop({
        left: (image.width() - size) / 2,
        top: (image.height() - size) / 2,
        width: size,
        height: size
      })
    }).then(function(image) {
      return image.scale({
        width: 600,
        height: 600
      })
    }).then(function(image) {
      // Make sure it's a JPEG to save disk space and bandwidth.
      return image.setFormat("JPEG")
    }).then(function(image) {
      // Get the image data in a Buffer.
      return image.data()
    }).then(function(buffer) {
      // Save the image into a new file.
      var base64 = buffer.toString("base64")
      var cropped = new Parse.File("image.jpg", { base64: base64 })
      return cropped.save()
    }).then(function(cropped) {
      // Attach the image file to the original object.
      post.set("image", cropped)
    }).then(function(result) {
      res.success()
    }, function(error) {
      res.error(error)
    })
  } else {
    res.success()
  }
})
