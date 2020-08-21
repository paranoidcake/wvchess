import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import './board.css'
import { classNames } from './styles'
import { Test } from '../test/Test'

export const Board = () => {
    const [pieces, setPieces] = useState(new Map<string, string>([
        ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
        ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
    ]))

    useEffect(() => {
        const fetchPieceBlobs = async () => {
            const urlCreator = window.URL || window.webkitURL
            // console.log("urlCreator:", urlCreator)
            const results = new Map<string, string>([
                ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
                ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
            ])
    
            for(let key of results.keys()) {
                const result = await fetch('http://localhost:5673/assets/' + key + '.png')
    
                const blob = await result.blob()
                const imageUrl = urlCreator.createObjectURL(blob)
    
                results.set(key, imageUrl)
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