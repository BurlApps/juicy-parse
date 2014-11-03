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
			var message = post.get("flatContent")
			var count = 0

      _.each(contacts, function(contact) {
        client.sendSms({
          to: "+1" + contact["phone"].match(/\d/g).join(""),
          from: settings.get("twilioShareNumber"),
          body: [
	          "Your friend shared this:\n\n",
	          message.substring(0, (68 - post.id.length)),
	          "...\n\nDownload Juicy to see the rest: ",
	          "http://", settings.get("host"), "/download/",
	          post.id
	        ].join("")
        }, function(error, response) {
	        count += 1

	        if(count == contacts.length) {
		        res.success("Share through twilio successfully")
	        }
        })
      })
    })
  })
})
