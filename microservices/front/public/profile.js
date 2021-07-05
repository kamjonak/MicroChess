function create_board (number, position) {
    const chess = new Chess();
    chess.load_pgn(position);
    var board1 = Chessboard('board' + number.toString(), chess.fen())
}

function copy_pgn(pgn) {
    navigator.clipboard.writeText(pgn);
}

function search_profile() {
    let name = document.getElementById('profile_name_input').value;
    if(name != '') {
        window.location.href = '/search/' + name;
    }
}
