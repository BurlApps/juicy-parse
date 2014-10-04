var Testers = Parse.Object.extend("Testers")
var Schools = Parse.Object.extend("Schools")

module.exports.home = function(req, res) {
  res.render('index')
}

module.exports.tester = function(req, res) {
  var query = new Parse.Query(Testers)
  var name  = req.param("name")
  var email = req.param("email")

  if(!name || !email) {
    return res.json({
      success: false,
      message: "Missing Information :("
    })
  }

  query.equalTo("email", email)
  query.first().then(function(tester) {
    if(!tester) {
      tester = new Testers()

      tester.set("name", name)
      tester.set("email", email)

      tester.save().then(function() {
        res.json({
          success: true,
          message: "Welcome to the Beta Club :)"
        })
      }, function(error) {
        res.json({
          success: false,
          message: "Something went wrong, sory :("
        })
        console.log(error)
      })
    } else {
      res.json({
        success: false,
        message: "Email already registered, sorry :("
      })
    }
  }, function(error) {
    res.json({
      success: false,
      message: "Something went wrong, sorry :("
    })
    console.log(error)
  })
}

module.exports.download = function(req, res) {
  // TODO: replace with itunes link or urx deeplink
  res.redirect("/")
}

module.exports.terms = function(req, res) {
  res.render('terms')
}

module.exports.privacy = function(req, res) {
  res.render('privacy')
}

module.exports.robots = function(req, res) {
  res.set('Content-Type', 'text/plain')
  res.render('robots')
}

module.exports.sitemap = function(req, res) {
  var query = new Parse.Query(Schools)
  var schools = []

  res.set('Content-Type', 'application/xml')

  query.each(function(school) {
    return schools.push(school.get("slug"))
  }).then(function() {
    res.render('sitemap', {
      schools: schools
    })
  }, function(error) {
    console.log(error)

    res.render('sitemap', {
      schools: schools
    })
  })
}
