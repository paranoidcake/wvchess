import { h } from 'preact'
import './board.css'
import { useEffect, useRef, useState } from 'preact/hooks'
import { classNames } from './styles'
import { useWebviewService } from '../../lib/WebviewService'
import { Piece, PieceType } from '../piece/Piece'

// TODO: Move these definitions to their own file

type BoardTile = {showPossibleMove: boolean, piece: BoardPiece}
export type BoardPiece = { type: PieceType; color: "w" | "b"; url: string | null; legalMoves: Move[]}
type Move = { src: string; dst: string; promotion?: string; flag: number; }

// TODO: Remove this, it's a dirty hack and the board state can be redesigned to remove the need for it
const useDeepState = <S,>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S), triggerDeepUpdate?: boolean) => void] => {
    const [internalState, setInternalState] = useState(initialState)
    const [_, setTrigger] = useState(false)

    const deepUpdater = (value: S | ((prevState: S) => S), triggerDeepUpdate: boolean = false) => {
        if(triggerDeepUpdate) setTrigger(last => !last)
        setInternalState(value)
    }

    return [internalState, deepUpdater]
}

export const Board = () => {
    const service = useWebviewService()

    // TODO: Fix the type system so the (await send(() => request).fields as any) pattern doesn't exist anymore
    const openDir = async (path: string) => ((await service.send(() => ({ tag: 'openDir', fields: { path: path, include_extensions: false } }))).fields as any).file_contents
    const getBoardString = async () => ((await service.send(() => ({tag: 'boardString'}))).fields as any).board_string

    const [board, setBoard] = useDeepState([[]] as BoardTile[][])

    const boardDirty = useRef(false)

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

    // Fetch image urls and initialise board
    useEffect(() => {
        const fetchBoardState = async () => {
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

                return results
            }

            const imageUrls = await fetchImageUrls()

            const boardString = await getBoardString()

            const isLowerCase = (str: string) => {
                return str == str.toLowerCase() && str != str.toUpperCase();
            }

            const result = []

            for(let row of boardString.trim().split('\n')) {
                const cur = [] as BoardTile[]
                for(let i = 0; i < 16; i += 2) {
                    const type = row[i].toLowerCase() as PieceType
                    const color = (isLowerCase(row[i]) ? "w" : "b") as "w" | "b"
                    const url = imageUrls.get(color)?.get(type) ?? null

                    cur.push({
                        showPossibleMove: false,
                        piece: {
                            type: type,
                            color: color,
                            url: url,
                            legalMoves: []
                        }
                    })
                }
                result.push(cur)
            }

            console.log("Board dirtied")
            boardDirty.current = true

            console.log("Setting board state")
            setBoard(result)
        }

        // console.log("Fetching board string")
        fetchBoardState()
    }, [])

    const getLegalMoves = async () => ((await service.send(() => ({tag: 'legalMoves'}))).fields as any).legal_moves

    const stringToMove = (moveString: string, flag: number): Move => {
        return {src: moveString[0] + moveString[1], dst: moveString[2] + moveString[3], promotion: moveString[4], flag: flag}
    }

    const squareToCoordinates = (square: string): [number, number] => {
        const offset = "a".charCodeAt(0)

        return [parseInt(square[1]) - 1, square.charCodeAt(0) - offset]
    }

    const coordinatesToSquare = (x: number, y: number): string => {
        const offset = "a".charCodeAt(0)

        return String.fromCharCode(offset + y) + (x + 1);
    }

    // Update legal moves
    // TODO: Replace this with a more fine-grained check to prevent constant updates to the whole board
    useEffect(() => {
        if(boardDirty.current === false) return;

        const updateLegalMoves = async () => {
            const moveMap = new Map<string, Move[]>();

            (await getLegalMoves() as [string, number][]).forEach(([moveString, flag]) => {
                let move = stringToMove(moveString, flag)
                let moveList = moveMap.get(move.src) ?? []
                moveList.push(move)

                moveMap.set(move.src, moveList)
            });

            // console.log("Board updating...")
            for(let i = 0; i < board.length; i++) {
                for(let j = 0; j < board[i].length; j++) {
                    setBoard(prevState => {
                        prevState[i][j].piece.legalMoves = moveMap.get(coordinatesToSquare(i, j))!
                        return prevState
                    })
                }
            }
        }

        // console.log("Board dirty, updating...")
        updateLegalMoves()
        boardDirty.current = false
    }, [board])

    return (
        <div>
            <span className={classNames.board}>
                {board.map((row, rindex) => row.map((tile, cindex) => {
                    const oddnessClass = (cindex - rindex) % 2 === 0 ? classNames["odd-tile"] : classNames["even-tile"]

                    const showMoveClass = tile.showPossibleMove ? classNames["show-possible-move"] : ""

                    return (
                    <span className={`${showMoveClass} ${oddnessClass}`}>
                        <Piece key={rindex + cindex} piece={tile.piece} onClick={() => {
                            for(const move of tile.piece.legalMoves) {
                                const [i, j] = squareToCoordinates(move.dst)

                                setBoard(prevState => {
                                    prevState[i][j].showPossibleMove = true
                                    return prevState
                                }, true)
                            }
                        }}/>
                    </span>
                    )
                }))}
            </span>
        </div>
    )
}