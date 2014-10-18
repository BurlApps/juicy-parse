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
	return $('																																	\
    <div class="post">                                                				\
    	<div class="message">' + post.message + '</div>                         \
			<div class="time">Posted <strong>' + post.duration + '</strong></div>   \
    </div>                                                                    \
  ')
}
