extern crate serde_json;
extern crate serde_derive;
use serde_derive::*;
use std::result::Result;
use std::option::Option;
use types::webview::{Request, Return};

pub mod fs;
pub mod chess;

#[derive(Serialize, Deserialize)]
pub struct Message<T> {
    subscription_id: String,
    message_id: String,
    inner: T
}

pub fn handle_message<
    T,
    H: Fn(&Request) -> Option<Result<Return, String>>
>(handle: web_view::Handle<T>, arg: String, handler: H) -> Result<(), web_view::Error> {
    let recieved: Message<Request> = serde_json::from_str(&arg).unwrap();

    let output = handler(&recieved.inner);

    match output {
        Some(response) => handle.dispatch(move | webview | {
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
        }),
        None => Ok(())
    }
}