mod lib;
extern crate web_view;
extern crate types;

use std::sync::Mutex;
use std::sync::Arc;

use web_view::{Content, WebView};
use pleco::Board;

fn main() {
    let html_content = include_str!("../dist/bundle.html");

    let mut rt = tokio::runtime::Runtime::new().unwrap();
    let board = Arc::new(Mutex::new(Board::default()));

    rt.block_on(async {
        web_view::builder()
            .title("My Project")
            .content(Content::Html(html_content))
            .resizable(true)
            .debug(true)
            .user_data(())
            .invoke_handler(|webview: &mut WebView<()>, arg: &str| {
                let handle = webview.handle();
                let message = arg.to_string();

                let board_clone = Arc::clone(&board);

                tokio::spawn(
                    async move {
                        lib::handle_message(handle, message, |request| {
                            use types::webview::Request::*;

                            let board_guard = board_clone.lock().unwrap();

                            match &request {
                                Open { path } => lib::fs::open(&path),
                                OpenDir { path, include_extensions } => lib::fs::open_dir(&path, &include_extensions),
                                Echo { text } => {
                                    Some(Ok(types::webview::Return::Echo { text: text.to_string() }))
                                },
                                BoardString => lib::chess::board_string(&board_guard),
                                LegalMoves => lib::chess::legal_moves(&board_guard)
                            }
                        })
                    }
                );

                Ok(())
            })
            .run()
            .unwrap();
         
    });
}
