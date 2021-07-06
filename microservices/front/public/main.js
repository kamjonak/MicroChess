var my_color = null;
var opponent = null;
var player = null;
var board = null;
var moves_disabled = true;
var game = new Chess()
var is_game_ended = false;


function initiate_board() {
  var url = "/get_initial_board_state";
  $.ajax({
      url: url,
      success: function(data) {
        if (data.status == 1)
          game_ended('something went wrong');
        else if (data.status == 2)
          game_ended('game_timeouted');

        my_color = data.color;
        opponent = data.opponent;
        player = data.player;
        $('#player').html(player);
        $('#opponent').html(opponent);

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
        board = Chessboard('chessboard', config);

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

function game_ended(info) {
  if (is_game_ended)
    return
  is_game_ended = true;
  $('#game-info').html(info);
  $('#game-info-modal').modal('show')
  disable_moving();
  $('#surrender-button').css('display', 'none');
  $('#go-back-button').css('display', 'inline-block');
}

function decided_result_game_info(data) {
  if (data.surrender) {
    if (data.game_state == 'white')
      game_ended('Black surrendered, white won');
    else
      game_ended('White surrendered, black won');
  }
  else {
    if (data.game_state == 'white')
      game_ended('White won');
    else if (data.game_state == 'black')
      game_ended('Black won');
    else
      game_ended('Draw');
  }
}

function hide_modal() {
  $('#game-info-modal').modal('hide');
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
    promotion: 'q'
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
}



updateStatus();

function go_back() {
  window.location.replace('/')
}

function surrender() {
  let url = '/surrender';
  $.ajax({
    url: url,
    success: function(data) {
      if (data.status == 0)
        decided_result_game_info(data);
      else 
    game_ended('You surrendered')
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
  $.ajax({
      url: url,
      success: function(data) {
        if (data.status == 1) {
          game_ended('something went wrong')
        }
        else if (data.status == 2) {
          opponent = (data.game_state == 'white' ? 'Black' : 'White');
          game_ended(opponent + " didn't move, " + data.game_state + " won!");
        }

        if (data.move == my_color)
          enable_moving();
        else 
          disable_moving()
        
        game.load(data.fen);
        onSnapEnd();
        updateStatus();

        if (data.game_state != 'undecided') {
          decided_result_game_info(data);
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
          decided_result_game_info(data);
        }
        else if (data.status == 1) {
          game_ended('something went wrong')
        }
        else if (data.status == 2) {
          game_ended("Game timeouted, " + data.winner + " won!");
        }
        else if (data.status == 3) {
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

function redirect_to_homepage() {
  window.location.href = '/';
}