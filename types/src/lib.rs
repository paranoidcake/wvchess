extern crate serde_derive;

pub mod webview {
    use std::collections::HashMap;
    use wasm_bindgen::prelude::*;
    use wasm_typescript_definition::*;
    use serde_derive::*;

    #[derive(Deserialize, Serialize, TypescriptDefinition)]
    #[serde(tag = "tag", content = "fields", rename_all = "camelCase")]
    pub enum Request {
        Open { path: String },
        OpenDir { path: String, include_extensions: bool },
        Echo { text: String },
        BoardString,
        LegalMoves
    }
    
    #[derive(Deserialize, Serialize, TypescriptDefinition, std::fmt::Debug)]
    #[serde(tag = "tag", content = "fields", rename_all = "camelCase")]
    pub enum Return {
        Open { file_content: Vec<u8> },
        OpenDir { file_contents: HashMap<String, Vec<u8>> },
        Echo { text: String },
        BoardString { board_string: String },
        LegalMoves {legal_moves: Vec<(String, u16)>}
    }
}