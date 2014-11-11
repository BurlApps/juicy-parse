var Posts = Parse.Object.extend("Posts")
var Queue = Parse.Object.extend("ConfessionsQueue")

Parse.Cloud.job("updateConfig", function(req, res) {
  var query = new Parse.Query(Parse.Installation)
  query.equalTo('deviceType', 'ios')

  Parse.Push.send({
    where: query,
    data: {
      action: "update.config"
    }
  }).then(function() {
    res.success("")
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
