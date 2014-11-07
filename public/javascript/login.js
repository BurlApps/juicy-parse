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
        if(response.success) {
	      	button.toggleClass("active", true)
	      	button.val("logging in now....")
	      	window.location.reload()
        } else {
	        enablePosting = true
	        button.val(response.message)
	        button.toggleClass("error", true)
	        form.find("input[type=password]").val("")
        }
      })
    }
  })
})
