var _ = require('underscore')
var twilio = require('twilio')

Parse.Cloud.define("shareSms", function(req, res) {
  var contacts = req.params.contacts
  var post = req.params.post
  var client = twilio(req.params.twilio.sid, req.params.twilio.token)

  var message = ""
  var download = "http://juicyapp.com/download"
  var promise = Parse.Promise.as()

  _.each(post.get("content"), function(content) {
    promise = promise.then(function() {
      message += content.message
      return message
    })
  })

  promise.then(function() {
    var innerPromise = Parse.Promise.as()
    if(str.length > 30) str = str.substring(0, 30)

    _.each(contacts, function(contact) {
      innerPromise = promise.then(function() {
        return client.sendSms({
          to: req.params.twilio.phone,
          from: contact["phone"],
          body: [
            "Your friend shared this with you on Juicy: ",
            message, "... Download juicy to find out the rest: ",
            download
          ].join("")
        })
      })
    })

    return innerPromise
  }).then(function() {
    res.success("Share through twilio successfully")
  }, function(error) {
    res.error(error.message)
  })
})
