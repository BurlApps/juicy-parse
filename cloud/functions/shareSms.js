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
    var promise = Parse.Promise.as()

    _.each(post.get("content"), function(content) {
      promise = promise.then(function() {
        if(content.message) {
          message += content.message
        }
	return message
      })
    })

    return promise
  }).then(function(post) {
    return Settings().then(function(settings) {
      var client  = Twilio(settings.get("twilioSid"), settings.get("twilioToken"))
      var promise = Parse.Promise.as()
      if(message.length > 40) message = message.substring(0, 40)

      _.each(contacts, function(contact) {
        promise = promise.then(function() {
          return client.sendSms({
            to: "+1" + contact["phone"].match(/\d/g).join(""),
            from: settings.get("twilioShareNumber"),
            body: [
              "Your friend shared this with you on Juicy: ",
              message, "... Download Juicy to find out the rest: ",
              "http://juicy.io"
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
