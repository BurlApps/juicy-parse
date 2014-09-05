$(function() {
  $(".form").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()

    var contact = $(this).find(".contact")
    var button = $(this).find(".submit").val("sending...")

    $.post($(this).attr("action"), $(this).serialize(), function(response) {
      button.val(response.message)
      button.toggleClass("error", !response.success)
      button.toggleClass("active", response.success)
      contact.toggleClass("active", response.success)
    })
  })
})
