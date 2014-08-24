var _ = require('underscore')
var twilio = require('twilio')

Parse.Cloud.define("shareSms", function(req, res) {
  var contacts = req.params.contacts
  var client = twilio(req.params.twilio.sid, req.params.twilio.token)
  var message = ""
  var download = "http://juicyapp.com/download"

  var Post = Parse.Object.extend("Posts")
  var post = new Post()
  post.id = req.params.post

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
    var promise = Parse.Promise.as()
    if(message.length > 30) message = message.substring(0, 30)

    _.each(contacts, function(contact) {
      promise = promise.then(function() {
        return client.sendSms({
          to: "+1" + contact["phone"].match(/\d/g).join(""),
          from: req.params.twilio.phone,
          body: [
            "Your friend shared this with you on Juicy: ",
            message, "... Download juicy to find out the rest: ",
            download
          ].join("")
        })
      })
    })

    return promise
  }).then(function() {
    res.success("Share through twilio successfully")
  }, function(error) {
    res.error(error.message)
  })
})
