$(function() {
  $(".checkbox").change(function() {
    $(this).parents("form").submit()
  })

  $("form").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()

    var form = $(this)
    $.post(form.attr("action"), form.serialize())
  })
})
