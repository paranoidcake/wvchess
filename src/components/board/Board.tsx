import { h } from 'preact'
import './board.css'
import { useEffect, useState } from 'preact/hooks'
import { classNames } from './styles'
import { Test } from '../test/Test'
import { useWebviewService } from '../../lib/WebviewService'

export const Board = () => {
    const service = useWebviewService()
    const openDir = (path: string) => service.send(() => ({tag: 'openDir', fields: { path: path, include_extensions: false }}))

    const [pieces, setPieces] = useState(new Map<string, string>([
        ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
        ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
    ]))

    useEffect(() => {
        const setPieceBlobs = async () => {
            const urlCreator = window.URL || window.webkitURL

            const results = new Map<string, string>([
                ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
                ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
            ])

            const map = await openDir('./assets/')

            for(let [key, value] of Object.entries(map)) {
                let bytes = new Uint8Array(value as Array<number>)
                const url = urlCreator.createObjectURL(new Blob([bytes.buffer], {type: 'image/png'}))
                results.set(key, url)
            }

            setPieces(results)
        }

        setPieceBlobs()
        // openFile('./src/components/board/worker.js').then(raw => {
            // const bytes = new Uint8Array(raw)
            // const decoded = new TextDecoder().decode(bytes.buffer)

            // const blob = new Blob(['('+decoded+')()'], { type: 'text/javascript' })
            // const url = urlCreator.createObjectURL(blob)
            // console.log(url)
            // const worker = new Worker(url)

            // worker.onmessage = (e: any) => {
            //     console.log("Returned message")
                // e.data[1].then((value: string) => {
                //     console.log("Setting key:", e.data[0], "value: ", value)
                //     results.set(e.data[0], value)
                //     setPieces(results)
                // })
            // }
    
            
        // })

        // for(let key of results.keys()) {
            // const result = new Uint8Array(await openFile('./assets/' + key + '.png'))

            // if(result) {
            //     const blob = new Blob([result.buffer])
            //     const imageUrl = urlCreator.createObjectURL(blob)

            //     results.set(key, imageUrl)
            // }
            // worker.postMessage([useWebviewService(), key])
        // }

        // const scriptContents = Array.prototype.map.call(document.querySelectorAll('script[type=\'text\/js-worker\']'), function (oScript) { return oScript.textContent; }) as Array<string>
        // console.log(scriptContents)
        // var blob = new Blob(scriptContents, { type: 'text/javascript' });
        // const worker = new Worker(urlCreator.createObjectURL(blob))
    }, [])

    return (
        <div>
            <Test />
            <Test />
            <img className={classNames.test} src={pieces.get('white_pawn')}/>
        </div>
    )
}