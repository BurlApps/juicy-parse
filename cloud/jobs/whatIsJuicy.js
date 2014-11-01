var _ = require('underscore')
var Posts = Parse.Object.extend("Posts")

Parse.Cloud.job("whatIsJuicy", function(req, res) {
  var karmaQuery = new Parse.Query(Posts)

  karmaQuery.descending("karma")
  karmaQuery.skip(10)
  karmaQuery.select(["karma"])

  karmaQuery.first().then(function(post) {
    if(post) {
      return post.get("karma")
    }

    return res.success("")
  }).then(function(topKarma) {
    var query = new Parse.Query(Posts)

    query.equalTo("juicy", false)
    query.greaterThanOrEqualTo('karma', topKarma)
    query.select(["juicy", "show"])

    return query.each(function(post) {
      post.set("show", true)
      post.set("juicy", true)
      return post.save()
    })
  }).then(function() {
    res.success("")
  }, function(error) {
    res.error(error.message)
  })
})
