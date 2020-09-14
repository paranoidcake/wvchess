use types::webview::Return;

pub fn get_board_string(board: &pleco::Board) -> Option<Result<Return, String>> {
    Some(
        Ok(
            types::webview::Return::GetBoardString {
                board_string: board.pretty_string()
            }
        )
    )
}