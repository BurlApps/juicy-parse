window.postQueue = []
window.postIndex = 0
window.pullingPosts = false
window.interval = null
window.mode = 0
window.attempted = false

function nextPost() {
  var unTouchedCount = window.postQueue.length - window.postIndex - 1

  if(!window.attempted) {
    if(window.postQueue.length <= window.postIndex) {
      return getPosts()
    } else if(unTouchedCount < 5) {
      getPosts()
    }
  }

  var post = window.postQueue[window.postIndex]
  var currentPost = $(".post")
  var newPost = buildPost(post)
  window.postIndex++

  $(".container").append(newPost)
  newPost.find(".message").vAlign()
  currentPost.fadeOut(1000)

  setTimeout(function() {
    newPost.animate({
      opacity: 1
    }, 500)

    currentPost.remove()
  }, (currentPost.length != 0) ? 1100 : 0)
}

function getPosts() {
  if(window.postQueue.length == 0) {
    window.postQueue.push({
      message: "Squeezing a fresh batch...",
      background: [0, 0, 0]
    })

    nextPost()
  }

  if(!window.pullingPosts) {
    var url = "/feed/posts"
    window.pullingPosts = true

    switch(window.mode) {
      case 1:
        url += "?images=true"
        break

      case 2:
        url += "?images=false"
        break
    }

    $.getJSON(url, function(posts) {
      window.pullingPosts = false
      window.attempted = false

      if(posts.length != 0) {
        posts.forEach(function(post) {
          window.postQueue.push(post)
        })

        if($(".post").length <= 1) {
          nextPost()
        }
      } else {
        if(window.interval) {
          clearInterval(window.interval)
        }

        window.attempted = true
        window.postQueue.push({
          message: "No posts found...",
          background: [0, 0, 0]
        })

        nextPost()
      }
    })
  }
}

function buildPost(post) {
  var element = $("                 \
    <div class='post'>              \
      <div class='darkener'></div>  \
      <div class='message'></div>   \
    </div>                          \
  ")

  element.find(".message").text(post.message).vAlign()
  element.find(".darkener").css("opacity", post.alpha)

  if(post.image) {
    element.css("background-image", "url('" + post.image + "')")
    element.find(".darkener").css("background", "rgba(0,0,0,0.5)")
  } else {
    element.css("background-color", "rgb(" + post.background.join(",") + ")")
  }

  return element
}

function resetInterval() {
  if(window.interval) {
    clearInterval(window.interval)
  }

  window.interval = setInterval(nextPost, 10000)
}

function eventListeners() {
  $(window).resize(function() {
    $(".post").find(".message").vAlign()
  })

  $(document).keydown(function(e) {
    if([37,38,39,40].indexOf(e.keyCode) != -1) {
      if([37,38].indexOf(e.keyCode) != -1) {
        if(window.postIndex <= 2) {
          return false
        }

        window.postIndex -= 2
      }

      nextPost()
      resetInterval()
    }
  });

  $(".image-toggle").click(function() {
    var toggle = $(this)
    window.mode++

    if(window.mode > 2) {
      window.mode = 0
    }

    switch(window.mode) {
      case 0:
        toggle.text("All Posts")
        break

      case 1:
        toggle.text("Images Only")
        break

      case 2:
        toggle.text("Text Only")
        break
    }

    window.postQueue = []
    window.postIndex = 0
    getPosts()
    resetInterval()
  })
}

$(function() {
  getPosts()
  resetInterval()
  eventListeners()
})
