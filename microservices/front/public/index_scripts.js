var in_queue = false;

function alert_code(info) {
    $('#info').html(info);
    $('#info-modal').modal('show')
}

function hide_modal() {
    $('#info-modal').modal('hide');
  }

function find_game() {
    if (in_queue)
        return;
    in_queue = true;
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
                alert_code("game cannot be found");
        }, 
        error: function(xhr, status, error) {
            alert_code(xhr.responseText);
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
                alert_code("game cannot be found");
        }, 
        error: function(xhr, status, error) {
            alert_code(xhr.responseText);
        }
    });
}

function create_custom() {
    if (in_queue)
        return;
    in_queue = true;

    document.getElementById('find-custom-game').removeAttribute('onclick');
    document.getElementById('find-custom-game').innerHTML = '';
    document.getElementById('find-custom-game').classList.remove('btn');
    document.getElementById('find-custom-game').classList.remove('btn-primary');
    document.getElementById('find-custom-game').classList.add('spinner-border');
    $.ajax({
        url: "/create_custom_game",
        success: function(data) {
            if (data.status == 0) {
                alert_code("Custom game code: " + data.code.toString());
                await_custom_game();
            }
            else
                alert_code("custom game cannot be found");
        }, 
        error: function(xhr, status, error) {
            alert_code(xhr.responseText);
        }
    });
}

function join_custom_game() {
    let code = document.getElementById('custom_code_input').value;

    $.ajax({
        url: '/join_custom_game',
        data: {code: code},
        type: 'POST',
        success: function(data) {
            if (data.status == 0)
                window.location.replace('/play');
            else
                alert_code("game cannot be found");
        }, 
        error: function(xhr, status, error) {
            alert_code(xhr.responseText);
        }
    });
}