import { h } from 'preact'
import { BoardPiece } from '../board/Board'

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"

export const Piece = ({piece, onClick}: {piece: BoardPiece, onClick?: h.JSX.MouseEventHandler<HTMLImageElement>}) => 
    piece.url !== null ?
    <img src={piece.url!} onClick={onClick}/>
    :
    <span />