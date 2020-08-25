// import { useWebviewService } from "../../lib/WebviewService"

onmessage = (e) => {
    // const service = useWebviewService()
    const service = e.data[0]
    const openFile = (path) => service.send(() => ({tag: 'open', fields: { path: path }}))
    const key = e.data[1]

    const getUrl = (key) => {
        const urlCreator = window.URL || window.webkitURL

        return openFile('./assets/' + key + '.png').then(result => {
            if(result) {
                const imageUrl = urlCreator.createObjectURL(new Blob([new Uint8Array(result).buffer]))
        
                return imageUrl
            }
        })
    }

    postMessage([key, getUrl(key)], window.parent.origin)
    console.log("Received message")
}