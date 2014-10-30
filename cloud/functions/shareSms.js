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
    return post.get("content").map(function(block) {
      return block.message
    }).join("")
  }).then(function(message) {
    return Settings().then(function(settings) {
      var client  = Twilio(settings.get("twilioSid"), settings.get("twilioToken"))
      var promise = Parse.Promise.as()

      _.each(contacts, function(contact) {
        promise = promise.then(function() {
          return client.sendSms({
            to: "+1" + contact["phone"].match(/\d/g).join(""),
            from: settings.get("twilioShareNumber"),
            body: [
              "Your friend shared this with you on Juicy: \n\n",
              message.substring(0, 60),
              "...\n\n Download Juicy to find out the rest: ",
              "http://",settings.get("host"),"/download"
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
