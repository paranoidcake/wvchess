use types::webview::Return;
use std::fs;

pub fn open(path: &String) -> Option<Result<Return, String>> {
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
}

pub fn open_dir(path: &String, include_extensions: &bool) -> Option<Result<Return, String>> {
    use std::collections::HashMap;
    let mut file_contents: HashMap<String, Vec<u8>> = HashMap::new();

    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(file) = entry {
                    match fs::read(file.path()) {
                        Ok(file_content) => {
                            let file_name;

                            if *include_extensions {
                                file_name = file.path().as_path().file_name()?.to_os_string().into_string();
                            } else {
                                file_name = file.path().as_path().file_stem()?.to_os_string().into_string();
                            }

                            if let Ok(key) = file_name {
                                // println!("{}", key);
                                file_contents.insert(key, file_content);
                            }
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
}