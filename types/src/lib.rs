extern crate serde_derive;

pub mod webview {
    use wasm_bindgen::prelude::*;
    use wasm_typescript_definition::*;
    use serde_derive::*;

    #[derive(Deserialize, Serialize, TypescriptDefinition)]
    #[serde(tag = "tag", content = "fields", rename_all = "camelCase")]
    pub enum Request {
        Open { path: String },
        Echo { text: String }
    }
    
    #[derive(Deserialize, Serialize, TypescriptDefinition, std::fmt::Debug)]
    #[serde(tag = "tag", content = "fields", rename_all = "camelCase")]
    pub enum Return {
        Open { file_content: Vec<u8> },
        Echo { text: String }
    }
}