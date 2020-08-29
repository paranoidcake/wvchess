import { h } from 'preact'
import './board.css'
import { useEffect, useState } from 'preact/hooks'
import { classNames } from './styles'
import { useWebviewService } from '../../lib/WebviewService'
// import { Chess } from '../../lib/Chess'
import { PieceType, Chess, ChessInstance } from 'chess.js'
import { Piece } from '../piece/Piece'

export const Board = () => {
    const service = useWebviewService()
    const openDir = (path: string) => service.send(() => ({tag: 'openDir', fields: { path: path, include_extensions: false }}))

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

    // const [chess, setChess] = useState(undefined as Chess | undefined)
    const [chess, setChess] = useState(new Chess())

    const nameToPiece = new Map<string, {type: PieceType, color: "w" | "b"}>([
        ['white_pawn', {type: 'p', color: 'w'}],
        ['white_knight', {type: 'p', color: 'w'}],
        ['white_bishop', {type: 'p', color: 'w'}],
        ['white_rook', {type: 'p', color: 'w'}],
        ['white_queen', {type: 'p', color: 'w'}],
        ['white_king', {type: 'p', color: 'w'}],

        ['black_pawn', {type: 'p', color: 'w'}],
        ['black_knight', {type: 'p', color: 'w'}],
        ['black_bishop', {type: 'p', color: 'w'}],
        ['black_rook', {type: 'p', color: 'w'}],
        ['black_queen', {type: 'p', color: 'w'}],
        ['black_king', {type: 'p', color: 'w'}]
    ])

    // TODO: Just fetch the image at load time
    // 
    // const getBoardWithImages = (chessInstance: ChessInstance ,imageUrls: Map<"w" | "b", Map<PieceType, string>>) => {
    //     const board = chessInstance.board()
    //     if(board !== null && imageUrls !== undefined) {
    //         const newBoard: { type: PieceType; color: "w" | "b"; imageUrl?: string | undefined; }[][] = []
    //         for(let i of board) {
    //             if(i !== null && i !== undefined) {
    //                 const row: { type: PieceType; color: "b" | "w"; imageUrl?: string | undefined }[] = []
    //                 for(let piece of row) {
    //                     if(piece !== null && piece !== undefined) {
    //                         // const newPiece: {type: PieceType, color: "b" | "w", imageUrl?: string} = {...piece, imageUrl: ''}
    //                         const newPiece = {type: piece.type, color: piece.color, imageUrl: imageUrls.get(piece.color)?.get(piece.type)}
        
    //                         // newPiece.imageUrl = this.imageUrls.get(piece.color)?.get(piece.type)
    //                         row.push(newPiece)
    //                     }
    //                 }
    //                 newBoard.push(row)
    //             }
    //         }
    
    //         return newBoard
    //     } else {
    //         return board
    //     }
    // }

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

            const map = await openDir('./assets/')

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

        console.log("Fetching image urls")
        fetchImageUrls()

        console.log("Current board state:")
        console.log(chess.ascii())
    }, [])

    return (
        <div>
            <span className={classNames.board}>
                {chess.board().map((row, rindex) => {
                    return row.map((piece, cindex) => {
                        const className = (() => {
                            if((cindex - rindex) % 2 === 0) {
                                return classNames["odd-tile"]
                            } else {
                                return classNames["even-tile"]
                            }
                        })()

                        return (
                        <span className={className}>
                            <Piece key={rindex + cindex} />
                        </span>
                        )
                    })
                })}
            </span>
        </div>
    )
}