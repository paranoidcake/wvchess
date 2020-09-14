import { h } from 'preact'

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"

export const Piece = ({pieceImage}: {pieceImage: string | null}) => {
    if(pieceImage !== null) {
        return (
            <img src={pieceImage} />
        )
    } else {
        return (
            // <img src={imageUrl} style="visibility: hidden"/>
            <span/>
        )
    }
}