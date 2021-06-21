
function find_game() {
  var url = "/find_game";
  $.ajax({
      url: url,
      success: function(data) {
          window.location.replace('/play')
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}