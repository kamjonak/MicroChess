
function send() {
    var xd = prompt("please choose your text");
    var url = "/send";
    $.ajax({
        url: url,
        data: {"content": xd},
        success: function(data) {
            alert(data);
        }, 
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
    alert("po");
}

function read() {
    var url = "/read";
    $.ajax({
        url: url,
        success: function(data) {
            alert(data);
        }, 
        error: function(xhr, status, error) {
            alert(xhr.responseText);
        }
    });
    alert("po");
}