$(function() {
  var enablePosting = true

  $(".form").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()

    if(enablePosting) {
      var form = $(this)
      var contact = form.find(".contact")
      var button = form.find(".submit").val("sending...")
      enablePosting = false

      $.post(form.attr("action"), form.serialize(), function(response) {
        enablePosting = true
        button.val(response.message)
        button.toggleClass("error", !response.success)
        button.toggleClass("active", response.success)
        contact.toggleClass("active", response.success)
        form.find("input[type=text], textarea").val("")
      })
    }
  })
})
