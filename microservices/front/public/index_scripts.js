
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

function await_custom_game() {
    $.ajax({
        url: '/await_custom_game',
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

function create_custom() {
    $.ajax({
        url: "/create_custom_game",
        success: function(data) {
            if (data.status == 0) {
                alert(data.code);
                await_custom_game();
            }
            else
                alert("custom game cannot be found");
        }, 
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

function join_custom_game() {
    let code = document.getElementById('custom_code_input').value;
    alert(code);

    $.ajax({
        url: '/join_custom_game',
        data: {code: code},
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