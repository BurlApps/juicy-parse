$(function() {
  var enablePosting = true

  $(".form").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()

    if(enablePosting) {
      var contact = $(this).find(".contact")
      var button = $(this).find(".submit").val("sending...")
      enablePosting = false

      $.post($(this).attr("action"), $(this).serialize(), function(response) {
        enablePosting = true
        button.val(response.message)
        button.toggleClass("error", !response.success)
        button.toggleClass("active", response.success)
        contact.toggleClass("active", response.success)
      })
    }
  })
})
