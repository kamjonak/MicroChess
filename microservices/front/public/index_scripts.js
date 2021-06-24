
function find_game() {
    var url = "/find_game";
    $.ajax({
        url: url,
        success: function(data) {
            if (data.status == 0)
                window.location.replace('/play');
            else
                alert("game cannot be found");
        }, 
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}