var _ = require('underscore')
var Twilio = require('twilio')
var Settings = require("cloud/util/settings")

Parse.Cloud.define("shareSms", function(req, res) {
  var contacts = req.params.contacts
  var message  = ""

  var Post = Parse.Object.extend("Posts")
  var post = new Post()
  post.id  = req.params.post

  post.fetch().then(function() {
    return Settings().then(function(settings) {
      var client  = Twilio(settings.get("twilioSid"), settings.get("twilioToken"))
      var promise = Parse.Promise.as()
			var message = post.get("flatContent")

      _.each(contacts, function(contact) {
        return promise = promise.then(function() {
          return client.sendSms({
            to: "+1" + contact["phone"].match(/\d/g).join(""),
            from: settings.get("twilioShareNumber"),
            body: [
              "Your friend shared this with you on Juicy:\n\n",
              message.substring(0, 70),
              "...\n\nDownload Juicy to find out the rest: ",
              "http://", settings.get("host"), "/download"
            ].join("")
          })
        })
      })

      return promise
    })
  }).then(function() {
	  res.success("Share through twilio successfully")
  }, function(error) {
    res.error(error.message)
  })
})
