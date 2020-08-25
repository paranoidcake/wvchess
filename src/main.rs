mod lib;
extern crate web_view;
extern crate types;
use web_view::{Content, WebView};
// use warp::Filter;

fn main() {
    let html_content = include_str!("../dist/bundle.html");

    let mut rt = tokio::runtime::Runtime::new().unwrap();

    // // TODO: Try replace this webserver with calls to and from Rust

    // let route = warp::path("assets")
    //     .and(warp::fs::dir( std::fs::canonicalize(std::path::PathBuf::from("./assets"))
    //         .expect("Assets folder not found!\nEnsure it is located in the same folder as the binary") )
    //     ).map(|file| {
    //         warp::reply::with_header(file, "Access-Control-Allow-Origin", "*")
    //     });

    rt.block_on(async {
        // tokio::spawn(async move {
        //     println!("Listening on 127.0.0.1:5673...");
        //     warp::serve(route).run(([127, 0, 0, 1], 5673)).await;
        // });

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
                            use std::fs;

                            match &request {
                                Open { path } => {
                                    let content = fs::read(path);

                                    match content {
                                        Ok(value) => Some(
                                            Ok(Return::Open {
                                                file_content: value
                                            })
                                        ), Err(error) => {
                                            Some( Err(format!("{}", error)) )
                                        }
                                    }
                                },
                                OpenDir { path, include_extensions } => {
                                    use std::collections::HashMap;
                                    let mut file_contents: HashMap<String, Vec<u8>> = HashMap::new();

                                    match fs::read_dir(path) {
                                        Ok(entries) => {
                                            for entry in entries {
                                                if let Ok(file) = entry {
                                                    match fs::read(file.path()) {
                                                        Ok(file_content) => {

                                                            if *include_extensions {
                                                                if let Ok(key) = file.path().as_path().file_name()?.to_os_string().into_string() {
                                                                    println!("{}", key);
                                                                    file_contents.insert(key, file_content);
                                                                }
                                                            } else {
                                                                if let Ok(key) = file.path().as_path().file_stem()?.to_os_string().into_string() {
                                                                    println!("{}", key);
                                                                    file_contents.insert(key, file_content);
                                                                }
                                                            }
                                                            // let file_path = file.path().into_os_string().into_string();
                                                            // if let Ok(key) = file_path {
                                                            //     file_contents.insert(key, file_content);
                                                            // }
                                                        },
                                                        Err(error) => {
                                                            return Some(Err(format!("{}", error)))
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        Err(error) => {
                                            return Some(Err(format!("{}", error)))
                                        }
                                    }

                                    return Some(Ok(Return::OpenDir{ file_contents: file_contents }))
                                },
                                Echo { text } => {
                                    Some(Ok(Return::Echo { text: text.to_string() }))
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