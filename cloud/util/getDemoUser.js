module.exports = function(cb, error) {
  var query = new Parse.Query(Parse.User)

  query.limit(1)
  query.first({
    success: cb,
    error: error
  })
}
