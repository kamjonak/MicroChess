
function send() {
    var xd = prompt("please choose your text");
    var url = "/send";
    $.ajax({
        url: url,
        data: {"content": xd},
        success: function(data) {
        }, 
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

function read() {
    var url = "/read";
    $.ajax({
        url: url,
        success: function(data) {
            document.getElementById("elements").innerHTML = data;
        }, 
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}