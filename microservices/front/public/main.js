
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function restart() {
    game.reset();
    board.start();
}

var moves_disabled = false;

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target, update=true) {
  // see if the move is legal

  if (moves_disabled) return 'snapback'

  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  if (update && !game.game_over())
    update_board_state(source, target)

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
  orientation: my_color,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config);

updateStatus();

function go_back() {
  window.location.replace('/test')
}

function disable_moving() {
  moves_disabled = true
}

function enable_moving() {
 moves_disabled = false
}

function get_next_board_state() {
  var url = "/get_board_state";
  // alert("i want to get it!")
  $.ajax({
      url: url,
      success: function(data) {
        // alert("zajebiscie, mam nowy board state")
        enable_moving()
        onDrop(data.source, data.target, false)
        onSnapEnd()
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}

function update_board_state(source, target) {
  disable_moving()
  var url = "/update_board_state";
  $.ajax({
      url: url,
      type: "POST",
      data: {source: source, target: target},
      success: function(data) {
        // alert(data)
        // alert("no dobra updated")
        get_next_board_state();
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}

function initiate_board() {
  if (my_color == 'black')  {
    moves_disabled = true;
    get_next_board_state()
  }
}

initiate_board()
