var Schools = Parse.Object.extend("Schools")

module.exports.post = function(message, imageLink, school) {
	var postID
	var data = {
    "message": message,
    "published": true,
    "feed_targeting": JSON.stringify({
			"countries": ['US']
		})
	}

	if(imageLink) {
		data["type"] = "link"
		data["link"] = imageLink
	}

  return school.fetch().then(function(school) {
    return Parse.Cloud.httpRequest({
	    method: "POST",
	    url: [
	      'https://graph.facebook.com/',
	      school.get("facebookPage"),
	      '/feed?&access_token=',
	      school.get("facebookToken")
	    ].join(""),
	    body: data,
	    success: function(httpResponse) {
		    postID = httpResponse.data.id.split("_")[1]
		  }
    })
  }).then(function() {
	  return postID
  })
}
