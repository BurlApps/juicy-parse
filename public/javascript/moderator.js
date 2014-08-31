// Init
$(function() {
  return getPosts()
})

// Util Methods
function getFormFromPost(post) {
  return {
    id: post.data("id"),
    message: post.find(".message").val()
  }
}

function confession(postAction) {
  return function() {
    var post = $(this).parents(".post")
    var form = getFormFromPost(post)

    $.ajax({
      url: "/moderator/confession",
      type: (postAction ? "POST" : "DELETE"),
      data: form
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
        getPosts()
      }
    }, 1000)
  }
}

function addListeners(post) {
  post.find(".push").click(confession(true))
  post.find(".delete").click(confession(false))
}

function buildPost(confession) {
  var post = $('                                                          \
    <div class="post" data-id="' + confession.id + '">                    \
      <textarea class="message">' + confession.message + '</textarea>     \
      <div class="actions">                                               \
        <input class="push button" type="submit" value="POST" />          \
        <input class="delete button" type="submit" value="DELETE" />      \
      </div>                                                              \
    </div>                                                                \
  ')

  return post
}

function getPosts() {
  $(".loading").show()

  $.getJSON("/moderator/confessions", function(confessions) {
    if(confessions.length != 0) {
      $(".loading").hide()

      $.each(confessions, function(index, confession) {
        var post = buildPost(confession)
        $(".posts").append(post)
        addListeners(post)
      })
    } else {
      $(".loading").text("No new confessions. Good job!")
    }
  })
}
