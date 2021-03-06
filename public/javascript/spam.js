// Init
$(function() {
	window.count = 0

  getPosts()

  setInterval(function() {
    if($(".posts .post").length == 0) {
      getPosts()
    }
  }, 30000)
})

// Util Methods
function getFormFromPost(post) {
  return {
    id: post.data("id"),
    _csrf: $(".csrf").val()
  }
}

function confession(action) {
  return function() {
    var post = $(this).parents(".post")
    var form = getFormFromPost(post)

    $.ajax({
      url: "/moderator/spam/confession",
      type: action,
      data: form
    }).done(function() {
      if($(".post").length == 0) {
        getPosts()
      }
    })

    post.animate({opacity: 0}, 250)

    setTimeout(function() {
      post.animate({
        margin: 0,
        padding: 0,
        height: 0
      }, 250)
    }, 350)

    setTimeout(function() {
      post.remove()

      if($(".post").length == 0) {
        $(".loading").show()
      }
    }, 1000)

    window.count--
    updateTitle()
  }
}

function addListeners(post) {
  post.find(".revert").click(confession("POST"))
  post.find(".delete").click(confession("DELETE"))
}

function buildPost(confession) {
  var post = $('                                                                \
    <div class="post" data-id="' + confession.id + '">                          \
      <div class="left">                                                        \
        <textarea class="message">' + confession.message + '</textarea>       	\
        <image class="image"/>																									\
        <div class="time">                                                      \
          <strong>' + confession.duration + '</strong>                          \
          via <strong>' + confession.source + '</strong>                        \
        </div>                                                                  \
      </div>                                                                    \
      <div class="right">                                                       \
        <div class="actions">                                                   \
          <input class="revert button" type="submit" value="REVERT" />          \
          <input class="delete button" type="submit" value="DELETE" />          \
        </div>                                                                  \
      </div>                                                                    \
    </div>                                                                      \
  ')

  if(confession.school) {
    post.find(".time").append('to <strong>' + confession.school.name + '</strong>')
  }

	if(confession.image) {
		post.find(".image")
			.attr("src", confession.image)
			.css("display", "block")
  }

  return post
}

function getPosts() {
  $(".loading").text("Loading spam confessions").show()
  var url = "/moderator/spam/confessions"

  if(window.school) {
    url += "?school=" + window.school
  }

  $.getJSON(url, function(confessions) {
  	window.count = confessions.length
  	updateTitle()

    if(confessions.length != 0) {
      $(".loading").hide()

      $.each(confessions, function(index, confession) {
        var post = buildPost(confession)
        $(".posts").append(post)
        addListeners(post)
      })
    } else {
      $(".loading").text("No spam confessions. Doing good!")
    }
  })
}

function updateTitle() {
	if(window.count > 0) {
		$("title").text("Spam Queue (" + window.count + ")")
	} else {
		$("title").text("Spam Queue")
	}
}
