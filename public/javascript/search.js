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
	var message = $('<div/>')
	   .text(post.message)
	   .html()
	   .replace(/(?:\r\n|\r|\n)/g, '<br />')
	var element = $('																														\
    <div class="post">                                                				\
    	<div class="message">' + message + '</div>                        	 	  \
    	<image class="image"/>																									\
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
  } else if(post.facebook) {
	  element.find(".bottom").append("																\
	  	<a class='right' href=" + post.facebook + " target='_blank'>	\
	  		Facebook																										\
	  	</a>																													\
	  ")
  } else if(post.source == "app") {
    element.find(".bottom").append("																\
	  	<a class='right' href='/download' target='_blank'>	          \
	  		iOS App 																										\
	  	</a>																													\
	  ")
  } else if(post.souce == "sms") {
    element.find(".bottom").append("																\
	  	<strong class='right'>SMS</strong>			                      \
	  ")
  }

  if(post.image) {
		element.find(".image")
			.attr("src", post.image)
			.css("display", "block")
  }

  return element
}
