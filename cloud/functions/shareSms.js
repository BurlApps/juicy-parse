var _ = require('underscore')
var twilio = require('twilio')

Parse.Cloud.define("shareSms", function(req, res) {
  var contacts = req.params.contacts
  var Settings = Parse.Object.extend("Settings")
  var message  = ""

  var Post = Parse.Object.extend("Posts")
  var post = new Post()
  post.id  = req.params.post

  post.fetch().then(function() {
    var promise = Parse.Promise.as()

    _.each(post.get("content"), function(content) {
      promise = promise.then(function() {
        message += content.message
        return message
      })
    })

    return promise
  }).then(function(post) {
    var query = new Parse.Query(Settings)

    return query.first().then(function(settings) {
      var client   = twilio(settings.get("twilioSid"), settings.get("twilioToken"))
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
