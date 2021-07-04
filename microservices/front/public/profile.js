function create_board (number, position) {
    const chess = new Chess();
    chess.load_pgn(position);
    var board1 = Chessboard('board' + number.toString(), chess.fen())
}

function copy_pgn(pgn) {
    navigator.clipboard.writeText(pgn);
}


