$(function() {
  var enablePosting = true

  $(".form").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()

    if(enablePosting) {
      var form = $(this)
      var button = form.find(".submit").val("sending...")
      enablePosting = false

      $.post(form.attr("action"), form.serialize(), function(response) {
        button.toggleClass("error", !response.success)
	      button.toggleClass("active", response.success)

        if(response.success) {
	        button.val("moderator created...")
	      	window.location.href = "/moderators"
        } else {
	        enablePosting = true
	        button.val(response.message)
        }
      })
    }
  })
})
