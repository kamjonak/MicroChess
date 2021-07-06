
function find_game() {
    var url = "/find_game";
    document.getElementById('find-game').removeAttribute('onclick');
    document.getElementById('find-game').innerHTML = '';
    document.getElementById('find-game').classList.remove('btn');
    document.getElementById('find-game').classList.remove('btn-primary');
    document.getElementById('find-game').classList.add('spinner-border');
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