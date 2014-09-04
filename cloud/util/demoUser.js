module.exports = function(cb, error) {
  var query = new Parse.Query(Parse.User)

  query.equalTo("admin", true)
  query.limit(1)
  query.first().then(cb, error)
}
