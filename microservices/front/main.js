
function doSomething() {
    var xd = prompt("please choose your text");
    var url = document.location.protocol + "//" + document.location.hostname + ":9000";
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

function doSomething2() {
    var url = document.location.protocol + "//" + document.location.hostname + ":9000/read";
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