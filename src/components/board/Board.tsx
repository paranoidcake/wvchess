import { h } from 'preact'
import './board.css'
import { useEffect, useState } from 'preact/hooks'
import { classNames } from './styles'
import { useWebviewService } from '../../lib/WebviewService'
import { Piece } from '../piece/Piece'

export const Board = () => {
    const service = useWebviewService()
    const openDir = (path: string) => service.send(() => ({tag: 'openDir', fields: { path: path, include_extensions: false }}))

    // const [imageUrls, setImageUrls] = useState(new Map<string, string>([
    //     ['white_pawn', ''], ['white_knight', ''], ['white_bishop', ''], ['white_rook', ''], ['white_queen', ''], ['white_king', ''], 
    //     ['black_pawn', ''], ['black_knight', ''], ['black_bishop', ''], ['black_rook', ''], ['black_queen', ''], ['black_king', ''] 
    // ]))

    const [imageUrls, setImageUrls] = useState(new Map([
        [0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], 
        [6, ''], [7, ''], [8, ''], [9, ''], [10, ''], [11, ''], [12, null] 
    ]))

    const numToName = new Map([
        [0, 'white_pawn'], [1, 'white_knight'], [2, 'white_bishop'], [3, 'white_rook'], [4, 'white_queen'], [5, 'white_king'], 
        [6, 'black_pawn'], [7, 'black_knight'], [8, 'black_bishop'], [9, 'black_rook'], [10, 'black_queen'], [11, 'black_king'], [12, 'none']
    ])

    const nameToNum = new Map([
        ['white_pawn', 0], ['white_knight', 1], ['white_bishop', 2], ['white_rook', 3], ['white_queen', 4], ['white_king', 5], 
        ['black_pawn', 6], ['black_knight', 7], ['black_bishop', 8], ['black_rook', 9], ['black_queen', 10], ['black_king', 11], ['none', 12]
    ])

    const [board, setBoard] = useState([
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12],
        [12, 12, 12, 12, 12, 12, 12, 12]
    ] as (number | 12)[][])

    const initialiseBoard = () => {
        const result: (number)[][] = []
        let offset = 0
        for(let i = 0; i < board.length; i++) {
            if(i - 4 >= 0) {
                offset = 6
            }
            result[i] = []
            for(let j = 0; j < board[i].length; j++) {
                result[i][j] = 12

                // Pawns
                if(i === 1 || i === 6) {
                    result[i][j] = offset + 0
                }

                // Back ranks
                if(i === 0 || i === 7) {
                    // Knights
                    if(j === 1 || j === 6) {
                        result[i][j] = offset + 1
                    }
                    // Bishops
                    if(j === 2 || j === 5) {
                        result[i][j] = offset + 2
                    }
                    // Rooks
                    if(j === 0 || j === 7) {
                        result[i][j] = offset + 3
                    }
                    // Queen
                    if(j === 3) {
                        result[i][j] = offset + 4
                    }
                    // King
                    if(j === 4) {
                        result[i][j] = offset + 5
                    }
                }
            }
        }

        console.log(result)

        setBoard(result)
    }

    useEffect(() => {
        const fetchImageUrls = async () => {
            const urlCreator = window.URL || window.webkitURL

            const results = new Map([
                [0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], 
                [6, ''], [7, ''], [8, ''], [9, ''], [10, ''], [11, ''], [12, null] 
            ])

            const map = await openDir('./assets/')

            for(let [key, value] of Object.entries(map)) {
                let bytes = new Uint8Array(value as Array<number>)
                const url = urlCreator.createObjectURL(new Blob([bytes.buffer], {type: 'image/png'}))
                results.set(nameToNum.get(key)!, url)
            }

            setImageUrls(results)
        }

        // Fetch image urls
        fetchImageUrls()

        // Populate board
        initialiseBoard()
    }, [])

    return (
        <div>
            <span className={classNames.board}>
                {board.map((row, rindex) => {
                    return row.map((piece, cindex) => {
                        let empty = ''
                        if(piece === 12) {
                            empty = " "+classNames["empty-tile"]
                        }
                        if((cindex - (rindex % 2)) % 2 === 0) {
                            return (
                            <span className={classNames["even-tile"] + empty}>
                                <Piece key={cindex} name={numToName.get(piece)!} imageUrl={imageUrls.get(piece)} />
                            </span>
                            )
                        } else {
                            return (
                            <span className={classNames["odd-tile"] + empty}>
                                <Piece key={cindex} name={numToName.get(piece)!} imageUrl={imageUrls.get(piece)} />
                            </span>
                            )
                        }
                    })
                })}
            </span>
        </div>
    )
}