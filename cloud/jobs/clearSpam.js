var Queue = Parse.Object.extend("ConfessionsQueue")

Parse.Cloud.job("clearSpam", function(req, res) {
  var query = new Parse.Query(Queue)
  var daysAgo = new Date()

  daysAgo.setDate(daysAgo.getDate()-4)

	query.equalTo("spam", true)
  query.lessThanOrEqualTo('updatedAt', daysAgo)

  query.each(function(confession) {
    confession.set("spam", false)
    return confession.save()
  }).then(function() {
    res.success()
  }, function(error) {
    console.log(error)
    res.error(error.message)
  })
})
