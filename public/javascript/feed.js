window.postQueue = []

function nextPost() {
  if(window.postQueue.length == 0) {
    return getPosts()
  } else if(window.postQueue.length < 5) {
    getPosts()
  }

  var post = window.postQueue[0]
  var currentPost = $(".post")
  var newPost = buildPost(post)
  window.postQueue.splice(0, 1)

  $(".container").append(newPost)
  newPost.find(".message").vAlign()
  currentPost.fadeOut(1000)

  setTimeout(function() {
    newPost.animate({
      opacity: 1
    }, 500)
    currentPost.remove()
  }, 1100)
}

function getPosts() {
  $.getJSON("/feed/posts", function(posts) {
    if(posts.length != 0) {
      posts.forEach(function(post) {
        window.postQueue.push(post)
      })

      if($(".post").length == 0) {
        nextPost()
      }
    }
  })
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
  element.css({
    "background-color": "rgba(" + post.background.join(",") + ", 1)",
    "background-image": "url('" + post.image + "')"
  })

  return element
}

$(function() {
  getPosts()
  setInterval(nextPost, 10000)
})
