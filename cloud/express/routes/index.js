var Twilio = require('twilio')
var Settings = require("cloud/util/settings")

module.exports.home = function(req, res) {
  res.render('home/index', {
	  template: 'home/index'
  })
}

module.exports.phone = function(req, res) {
  var phone = req.param("phone")

  Settings().then(function(settings) {
    var client  = Twilio(settings.get("twilioSid"), settings.get("twilioToken"))

	  return client.sendSms({
      to: "+1" + phone.match(/\d/g).join(""),
      from: settings.get("twilioShareNumber"),
      body: [
	      "Ready to see the JUICIEST gossip by your friends? ",
	      "Download the app to get your daily fix: ",
	      "http://", settings.get("host"), "/download"
      ].join("")
	  })
	}).then(function() {
	  res.json({
	    success: true,
	    message: "Welcome to Juicy!"
	  })
	}, function(error) {
		console.log(error)

		res.json({
	    success: false,
	    message: "Something went wrong, sorry :("
	  })
	})
}

module.exports.notfound = function(req, res) {
  res.redirect("/")
}

module.exports.download = function(req, res) {
  Settings().then(function(settings) {
  	res.redirect(settings.get("itunesLink"))
  })
}

module.exports.terms = function(req, res) {
  res.render('legal/terms')
}

module.exports.privacy = function(req, res) {
  res.render('legal/privacy')
}

module.exports.robots = function(req, res) {
  res.set('Content-Type', 'text/plain')
  res.render('seo/robots')
}

module.exports.sitemap = function(req, res) {
  var query = new Parse.Query(Schools)
  var schools = []

  res.set('Content-Type', 'application/xml')

  query.each(function(school) {
    return schools.push(school.get("slug"))
  }).then(function() {
    res.render('seo/sitemap', {
      schools: schools
    })
  }, function(error) {
    console.log(error)

    res.render('sitemap', {
      schools: schools
    })
  })
}
