$(function() {
	$(".form").on("submit", function(e) {
		e.preventDefault()
		e.stopPropagation()

		$(".results").html("")
		var form = $(this)

		$.post(form.attr("action"), form.serialize(), function(posts) {
			posts.forEach(function(post) {
        $(".results").append(buildPost(post))
      })
		})
	})

	$(".form").submit()
})

function buildPost(post) {
	var element = $('																														\
    <div class="post">                                                				\
    	<div class="message">' + post.message + '</div>                         \
			<div class="bottom">																										\
				<div class="left">																										\
					Created <strong>' + post.duration + '</strong></div>								\
				</div>																																\
    </div>                                                                    \
  ')

  if(!post.show) {
	  element.find(".bottom").append("						\
	  	<strong class='right'>Hidden</strong>			\
	  ")
  }

  return element
}
