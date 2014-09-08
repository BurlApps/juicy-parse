var Settings = require("cloud/util/settings")

/*
module.exports.generate = function() {
  return Settings().then(function(settings) {
    var admin = settings.get("facebookAdmin")

    return Parse.Cloud.httpRequest({
        method: "POST",
        url: [
          'https://graph.facebook.com',
          '/oauth/authorize?client_id=',
          settings.get("facebookID"),
          '&client_id=',
          settings.get("facebookID"),
          settings.get("facebookToken")
        ].join(""),
        body: {
          message: message,
          published: true
        }
    })

  })
}

*/

module.exports.post = function(message) {
  return Settings().then(function(settings) {
    return Parse.Cloud.httpRequest({
        method: "POST",
        url: [
          'https://graph.facebook.com/',
          settings.get("facebookPage"),
          '/feed?&access_token=',
          settings.get("facebookToken")
        ].join(""),
        body: {
          message: message,
          published: true
        }
    })
  })
}
