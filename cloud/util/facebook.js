var Schools = Parse.Object.extend("Schools")

module.exports.post = function(message, schoolID) {
  var school = new Schools()

  school.id = schoolID

  return school.fetch().then(function(school) {
    return Parse.Cloud.httpRequest({
        method: "POST",
        url: [
          'https://graph.facebook.com/',
          school.get("facebookPage"),
          '/feed?&access_token=',
          school.get("facebookToken")
        ].join(""),
        body: {
          message: message,
          published: true
        }
    })
  })
}
