// Init
$(function() {
  return getPosts()
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
  }
}

function addListeners(post) {
  post.find(".revert").click(confession("POST"))
}

function buildPost(confession) {
  return $('                                                                    \
    <div class="post" data-id="' + confession.id + '">                          \
      <div class="left">                                                        \
        <textarea class="message">"' + confession.message + '"</textarea>       \
        <div class="time">                                                      \
          Posted <strong>' + confession.duration + '</strong>                   \
          via the <strong>' + confession.source + '</strong>                    \
        </div>                                                                  \
      </div>                                                                    \
      <div class="right">                                                       \
        <div class="actions">                                                   \
          <input class="revert button" type="submit" value="REVERT" />          \
        </div>                                                                  \
      </div>                                                                    \
    </div>                                                                      \
  ')
}

function getPosts() {
  $(".loading").show()

  $.getJSON("/moderator/spam/confessions", function(confessions) {
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
