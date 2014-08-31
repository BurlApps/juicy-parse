var Settings = require("cloud/util/settings")

module.exports.post = function(message) {
  return Settings().then(function(settings) {
    return Parse.Cloud.httpRequest({
        method: "POST",
        url: [
          'https://graph.facebook.com/',
          settings.get("facebookPage"),
          '/feed?&access_token=',
          settings.get("facebookID"),
          "|",
          settings.get("facebookSecret")
        ].join(""),
        body: {
          message: message,
          published: true
        }
    })
  })
}
