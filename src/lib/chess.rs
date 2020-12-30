use types::webview::Return;
use types::webview::Return::*;

pub fn board_string(board: &pleco::Board) -> Option<Result<Return, String>> {
    Some(Ok(BoardString {board_string: board.pretty_string()}))
}

pub fn legal_moves(board: &pleco::Board) -> Option<Result<Return, String>> {
    let moves_list: Vec<(String, u16)> = board.generate_moves().into_iter().map(|x| { (x.stringify(), x.flag()) }).collect();

    return Some(Ok(LegalMoves {legal_moves: moves_list}))
}