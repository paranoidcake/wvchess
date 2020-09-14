import { h } from 'preact'
import './board.css'
import { useEffect, useState } from 'preact/hooks'
import { classNames } from './styles'
import { useWebviewService } from '../../lib/WebviewService'
// import { Chess } from '../../lib/Chess'
// import { PieceType, Chess, ChessInstance } from 'chess.js'
import { Piece, PieceType } from '../piece/Piece'

export const Board = () => {
    const service = useWebviewService()
    const openDir = (path: string) => service.send(() => ({tag: 'openDir', fields: { path: path, include_extensions: false }}))
    const getBoardString = () => service.send(() => ({tag: 'getBoardString'}))

    const [imageUrls, setImageUrls] = useState(
        new Map<"w" | "b", Map<PieceType, string>>([
            ["w", new Map([
                ["b", ""], ["p", ""], ["n", ""], ["r", ""], ["q", ""], ["k", ""]
            ])], 
            ["b", new Map([
                ["b", ""], ["p", ""], ["n", ""], ["r", ""], ["q", ""], ["k", ""]
            ])]
        ])
    )

    // TODO Use Rust to manage the board state
    // const [chess, setChess] = useState(undefined as Chess | undefined)
    // const [chess, setChess] = useState(new Chess())
    const [board, setBoard] = useState([[]] as { type: PieceType; color: "w" | "b"; }[][])

    const nameToPiece = new Map<string, {type: PieceType, color: "w" | "b"}>([
        ['white_pawn', {type: 'p', color: 'w'}],
        ['white_knight', {type: 'n', color: 'w'}],
        ['white_bishop', {type: 'b', color: 'w'}],
        ['white_rook', {type: 'r', color: 'w'}],
        ['white_queen', {type: 'q', color: 'w'}],
        ['white_king', {type: 'k', color: 'w'}],

        ['black_pawn', {type: 'p', color: 'b'}],
        ['black_knight', {type: 'n', color: 'b'}],
        ['black_bishop', {type: 'b', color: 'b'}],
        ['black_rook', {type: 'r', color: 'b'}],
        ['black_queen', {type: 'q', color: 'b'}],
        ['black_king', {type: 'k', color: 'b'}]
    ])

    // Fetch image urls
    useEffect(() => {
        const fetchImageUrls = async () => {
            const urlCreator = window.URL || window.webkitURL

            const results = new Map<"w" | "b", Map<PieceType, string>>([
                ["w", new Map([
                    ["b", ""], ["p", ""], ["n", ""], ["r", ""], ["q", ""], ["k", ""]
                ])], ["b", new Map([
                    ["b", ""], ["p", ""], ["n", ""], ["r", ""], ["q", ""], ["k", ""]
                ])]
            ])

            const map = await openDir('./assets/240px')

            for(let [key, value] of Object.entries(map)) {
                let bytes = new Uint8Array(value as Array<number>)
                const url = urlCreator.createObjectURL(new Blob([bytes.buffer], {type: 'image/png'}))
                // results.set(nameToNum.get(key)!, url)

                const piece = nameToPiece.get(key)!
                const newMap = results.get(piece.color)!.set(piece.type, url)
                results.set(piece.color, newMap)
            }

            setImageUrls(results)
        }

        const fetchBoardState = async () => {
            const boardString: string = await getBoardString()

            const isLowerCase = (str: string) => {
                return str == str.toLowerCase() && str != str.toUpperCase();
            }

            const result = []

            // console.log(boardString)

            // r n b q k b n r 
            // p p p p p p p p 
            // - - - - - - - - 
            // - - - - - - - - 
            // - - - - - - - - 
            // - - - - - - - - 
            // P P P P P P P P 
            // R N B Q K B N R

            for(let row of boardString.trim().split('\n')) {
                const cur = []
                for(let i = 0; i < 16; i += 2) {
                    cur.push({type: row[i].toLowerCase() as PieceType, color: isLowerCase(row[i]) ? "w" as "w" | "b" : "b" as "w" | "b"})
                }
                result.push(cur)
            }

            setBoard(result)
        }

        console.log("Fetching image urls")
        fetchImageUrls()

        console.log("Fetching board string")
        fetchBoardState()

        // console.log("Current board state:")
        // console.log(chess.ascii())
    }, [])

    return (
        <div>
            <span className={classNames.board}>
                {board.map((row, rindex) => {
                    return row.map((piece, cindex) => {
                        console.log("Current piece", piece)
                        const className = (() => {
                            if((cindex - rindex) % 2 === 0) {
                                return classNames["odd-tile"]
                            } else {
                                return classNames["even-tile"]
                            }
                        })()

                        let url = null

                        if(piece !== null) {
                            url = imageUrls.get(piece.color)?.get(piece.type) ?? null
                        }

                        return (
                        <span className={className}>
                            <Piece key={rindex + cindex} pieceImage={url} />
                        </span>
                        )
                    })
                })}
            </span>
        </div>
    )
}