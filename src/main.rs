mod lib;
extern crate web_view;
extern crate types;
use web_view::{Content, WebView};
use warp::Filter;

fn main() {
    let html_content = include_str!("../dist/bundle.html");

    let mut rt = tokio::runtime::Runtime::new().unwrap();

    // TODO: Try replace this webserver with calls to and from Rust

    let route = warp::path("assets")
        .and(warp::fs::dir( std::fs::canonicalize(std::path::PathBuf::from("./assets"))
            .expect("Assets folder not found!\nEnsure it is located in the same folder as the binary") )
        ).map(|file| {
            warp::reply::with_header(file, "Access-Control-Allow-Origin", "*")
        });

    rt.block_on(async {
        tokio::spawn(async move {
            println!("Listening on 127.0.0.1:5673...");
            warp::serve(route).run(([127, 0, 0, 1], 5673)).await;
        });

        
        web_view::builder()
            .title("My Project")
            .content(Content::Html(html_content))
            .resizable(true)
            .debug(true)
            .user_data(())
            .invoke_handler(|webview: &mut WebView<()>, arg: &str| {
                let handle = webview.handle();
                let message = arg.to_string();

                tokio::spawn(
                    async move {
                        lib::handle_message(handle, message, |request| {
                            use types::webview::Request::*;
                            use types::webview::Return;
                    
                            match &request {
                                Init => {
                                    None
                                }
                                Log { text } => {
                                    println!("{}", text);
                                    None
                                }
                                Increment { number } => {
                                    Some(Return::Increment {
                                        number: *number + 1
                                    })
                                }
                                DelayedIncrement { number } => {
                                    std::thread::sleep(std::time::Duration::from_millis(1000));
                                    Some(Return::DelayedIncrement {
                                        number: *number + 1
                                    })
                                }
                                ToUpperCase { text } => {
                                    let text: &String = text;
                                    Some(Return::ToUpperCase {
                                        text: text.to_string().to_ascii_uppercase()
                                    })
                                }
                                Test => {
                                    None
                                }
                            }
                        }
                    )
                });

                Ok(())
            })
            .run()
            .unwrap();
            
    });
}