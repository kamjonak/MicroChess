
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


var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function restart() {
    game.reset();
    board.start();
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config);

updateStatus();

function send_rabbit() {
  var url = "/send_rabbit";
  $.ajax({
      url: url,
      success: function(data) {
          alert(data);
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}

function receive_rabbit() {
  var url = "/receive_rabbit";
  $.ajax({
      url: url,
      success: function(data) {
          alert(data);
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}
