var _ = require('underscore');

Parse.Cloud.job("whatIsJuicy", function(req, res) {
  var postsObject = Parse.Object.extend("Posts")
  var oneDayQuery = new Parse.Query(postsObject)

  var oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate()-1);
  oneDayQuery.greaterThan('updatedAt', oneDayAgo);
  oneDayQuery.limit(1000)

  oneDayQuery.find().then(function(posts) {
    var karma = 0

    for(var i = 0; i < posts.length; i++) {
      karma += posts[i].get("karma")

      if(i == (posts.length - 1)) {
        var average = Math.ceil(karma/posts.length)
        var seventyFifth = average + Math.abs(average/2)
        return seventyFifth
      }
    }
  }).then(function(seventyFifth) {
    var topQuery = new Parse.Query(postsObject)
    topQuery.greaterThan('karma', seventyFifth);

    topQuery.each(function(post) {
      post.set("juicy", true)
      return post.save()
    })

    return seventyFifth
  }).then(function(seventyFifth) {

    var bottomQuery = new Parse.Query(postsObject)
    bottomQuery.lessThan('karma', seventyFifth);

    return bottomQuery.each(function(post) {
      post.set("juicy", false)
      return post.save()
    })
  }).then(function() {
    res.success()
  }, function(error) {
    res.error(error)
  })
})
