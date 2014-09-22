module.exports = function() {
  return Parse.Config.get()
}

module.exports.getBackground = function(settings) {
    var backgrounds = settings.get("backgrounds")
    var keys = Object.keys(backgrounds)
    return backgrounds[keys[Math.floor(keys.length * Math.random())]]
  }
