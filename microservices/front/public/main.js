var my_color = null;
var opponent = null;
var board = null
var moves_disabled = true;
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')


function initiate_board() {
  var url = "/get_initial_board_state";
  // alert("i want to get it!")
  $.ajax({
      url: url,
      success: function(data) {
        if (data.status == 1) {
          alert("something went wrong")
          window.location.replace('/test');
        }
        else if (data.status == 2) {
          alert("game timeouted");
          window.location.replace('/test');
        }

        my_color = data.color;
        opponent = data.opponent;

        if (data.move == my_color)
          enable_moving();
        
        
        game.load(data.fen);

        var config = {
          draggable: true,
          position: game.fen(),
          orientation: my_color,
          onDragStart: onDragStart,
          onDrop: onDrop,
          onSnapEnd: onSnapEnd
        }
        board = Chessboard('myBoard', config);

        onSnapEnd();
        updateStatus();

        if (data.move != my_color)
          get_next_board_state();
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}

initiate_board();

function restart() {
    game.reset();
    board.start();
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((my_color == 'white' && piece.search(/^b/) !== -1) || (my_color == 'black' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal

  if (moves_disabled) return 'snapback'

  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  if (source != target)
    update_board_state(source, target)

  updateStatus();
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



updateStatus();

function go_back() {
  window.location.replace('/test')
}

function surrender() {
  let url = '/surrender';
  $.ajax({
    url: url,
    success: function(data) {
      alert("you surrendered");
    }, 
    error: function(xhr, status, error) {
        alert(xhr.responseText);
    }
});
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
        if (data.status == 1) {
          alert("something went wrong")
          //window.location.replace('/test');
        }
        else if (data.status == 2) {
          alert("Game timeouted, " + data.winner + " won!");
          //window.location.replace('/test');
        }

        if (data.move == my_color)
          enable_moving();
        else 
          disable_moving()
        
        // $fen = data.fen
        game.load(data.fen);
        onSnapEnd();
        updateStatus();

        if (data.game_state != 'undecided') {
          alert(data.game_state)
          disable_moving()
        }
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
        if (data.status == 0) {
          if (data.game_state == 'undecided')
            get_next_board_state();
          else
            alert(data.game_state)
        }
        else if (data.status == 1) {
          alert("something went wrong")
        }
        else if (data.status == 2) {
          alert("Game timeouted, " + data.winner + " won!");
        }
        else if (data.status == 3) {
          alert("status 3")
          if (data.move == my_color)
            enable_moving()
          else
            disable_moving()

          game.load(data.fen)
          onSnapEnd();
          updateStatus();
        }
      }, 
      error: function(xhr, status, error) {
          alert(xhr.responseText);
      }
  });
}


