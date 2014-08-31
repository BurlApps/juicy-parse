var Settings = Parse.Object.extend("Settings")

module.exports = function() {
  var query = new Parse.Query(Settings)
  return query.first()
}
