extern crate web_view;
extern crate types;
use web_view::{Content, WebView};
use warp::Filter;

fn main() {
    let html_content = include_str!("../dist/bundle.html");

    let mut rt = tokio::runtime::Runtime::new().unwrap();

    // let hello = warp::path!("hello" / String);
    
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

        tokio::spawn(
            async move {
                web_view::builder()
                    .title("My Project")
                    .content(Content::Html(html_content))
                    .resizable(true)
                    .debug(true)
                    .user_data(())
                    .invoke_handler(|webview: &mut WebView<()>, arg: &str| {
                        handle_message(webview.handle(), arg.to_string(), |request| {
                            use types::webview::Request::*;
                            use types::webview::*;
                    
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
                        });
                        Ok(())
                    })
                    .run()
                    .unwrap();
            }
        );
    });
}

extern crate serde_json;
extern crate serde_derive;
use serde_derive::*;

#[derive(Serialize, Deserialize)]
pub struct Message<T> {
    subscription_id: String,
    message_id: String,
    inner: T
}

fn handle_message<
    H: Fn(&types::webview::Request) -> std::option::Option<types::webview::Return> + Send
>(handle: web_view::Handle<()>, arg: String, handler: H) {
    let recieved: Message<types::webview::Request> = serde_json::from_str(&arg).unwrap();

    // // TODO: Get this to be passed into the function without needing a static lifetime
    let output = handler(&recieved.inner);

    if let Some(response) = output {
        handle.dispatch(move | webview | {
            let sending = Message {
                subscription_id: recieved.subscription_id,
                message_id: recieved.message_id,
                inner: serde_json::to_string(&response).unwrap()
            };

            let eval_script = format!(
                r#"document.dispatchEvent(
                    new CustomEvent("{event_name}", {{ detail: {{ messageId: {message_id:?}, inner: {content} }} }})
                );"#,
                event_name = sending.subscription_id,
                message_id = sending.message_id,
                content = sending.inner
            );

            webview.eval(&eval_script)
        }).expect("Failed to send response");
    }
}