var Settings = require("cloud/util/settings")

module.exports.post = function(message, school) {
  return Settings().then(function(settings) {
    return school.fetch().then(function(school) {
      return Parse.Cloud.httpRequest({
          method: "POST",
          url: [
            'https://graph.facebook.com/',
            school.get("facebookPage"),
            '/feed?&access_token=',
            (school.get("facebookToken") || settings.get("facebookToken"))
          ].join(""),
          body: {
            message: message,
            published: true
          }
      })
    })
  })
}
