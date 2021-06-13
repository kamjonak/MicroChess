
function doSomething() {
    alert("siema");
    $.ajax({
        url: "http://middle",
        success: function (data) {
            alert("GONWO");
        }
    });
    alert("po");
}