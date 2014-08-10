var fs = require("fs")

Parse.Cloud.define("seedPosts", function(request, response) {
  var seedData = __dirname + "/../seedData/posts/"
  var images = fs.readdirSync(seedData)
  var Post = Parse.Object.extend("Posts")

  var query = new Parse.Query(Parse.User);
  query.first().then(function(user) {
    for(var i=0; i<images.length; i++) {
      var post = new Post()
      var relation = post.relation("aboutUsers")
      relation.add(user)

      post.set("likes", 10)
      post.set("juicy", i%4 == 0)
      post.set("creator", user)

      imageName = images[i]
      imageData = fs.readFileSync(seedData + images[i])
      post.set("image", new Parse.File(imageName, imageData))
      post.save(null)
    }
  })
});
