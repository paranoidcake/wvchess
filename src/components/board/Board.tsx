import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import './board.css'
import { classNames } from './styles'
import { Test } from '../test/Test'
import { useWebviewService } from '../../WebviewService'
import * as base64 from '../../lib/base64'

export const Board = () => {
    const [pieces, setPieces] = useState(new Map<string, string>([
        ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
        ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
    ]))

    const service = useWebviewService()
    const openFile = (path: string) => service.send(() => ({tag: 'open', fields: { path: path }}))

    useEffect(() => {
        const fetchPieceBlobs = async () => {
            // const urlCreator = window.URL || window.webkitURL
            // console.log("urlCreator:", urlCreator)
            const results = new Map<string, string>([
                ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
                ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
            ])

            for(let key of results.keys()) {
                // const result = await fetch('http://localhost:5673/assets/' + key + '.png')
                const result = await openFile('./assets/' + key + '.png') as Uint8Array
                // console.log(result)

                if(result) {
                    const encoded = base64.bytesToBase64(result)
                    // TODO: Use blobs instead of inlining the image
                    // const blob = new Blob([result], {type: 'image/png'})
                    // const imageUrl = urlCreator.createObjectURL(blob)

                    results.set(key, 'data:image/png;base64,' + encoded)
                }
            }

            setPieces(results)
        }

        fetchPieceBlobs()
    }, [])

    return (
        <div>
            <Test />
            <Test />
            <img className={classNames.test} src={pieces.get('white_pawn')}/>
        </div>
    )
}