// Init
$(function() {
  return getPosts()
})

// Util Methods
function getFormFromPost(post) {
  return {
    id: post.data("id"),
    message: post.find(".message").val(),
    adminNote: post.find(".adminNote").val(),
    _csrf: $(".csrf").val()
  }
}

function confession(action) {
  return function() {
    var post = $(this).parents(".post")
    var form = getFormFromPost(post)

    $.ajax({
      url: "/moderator/confession",
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
  }
}


function addListeners(post) {
  post.find(".push").click(confession("POST"))
  post.find(".delete").click(confession("DELETE"))
  post.find(".spam").click(confession("PUT"))
}

function buildPost(confession) {
  var post  = $('                                                                                     \
    <div class="post" data-id="' + confession.id + '">                                                \
      <div class="left">                                                                              \
        <textarea class="message">' + confession.message + '</textarea>                               \
        <textarea class="adminNote" placeholder="Admin note">' + confession.adminNote + '</textarea>  \
        <div class="time">                                                                            \
          <strong>' + confession.duration + '</strong>                                                \
          via <strong>' + confession.source + '</strong>                                              \
        </div>                                                                                        \
      </div>                                                                                          \
      <div class="right">                                                                             \
        <div class="actions">                                                                         \
          <input class="push button" type="submit" value="POST" />                                    \
          <input class="delete button" type="submit" value="DELETE" />                                \
          <input class="spam button" type="submit" value="SPAM" />                                    \
        </div>                                                                                        \
      </div>                                                                                          \
    </div>                                                                                            \
  ')

  if(confession.school) {
    post.find(".time").append('to <strong>' + confession.school.name + '</strong>')
  } else {
    post.find(".push.button").val("ACCEPT")
  }

  return post
}

function getPosts() {
  $(".loading").show()
  var url = "/moderator/confessions"

  if(window.school) {
    url += "?school=" + window.school
  }

  $.getJSON(url, function(confessions) {
    if(confessions.length != 0) {
      $(".loading").hide()

      $.each(confessions, function(index, confession) {
        var post = buildPost(confession)
        $(".posts").append(post)
        addListeners(post)
      })
    } else {
      $(".loading").text("No new confessions. Good work!")
    }
  })
}
