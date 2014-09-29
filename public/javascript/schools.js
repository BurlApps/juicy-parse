$(function() {
  $(".school-button").click(function() {
    var popup = $(".school-popup").fadeIn()
  })

  $(".popup-darkener, .popup-close").click(function() {
    $(".school-popup").fadeOut()
  })
})
