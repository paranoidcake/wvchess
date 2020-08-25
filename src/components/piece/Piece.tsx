import { h } from 'preact'

export const Piece = ({name, imageUrl}: {name?: string, imageUrl?: string | null}) => {
    if(imageUrl !== null) {
        return (
            <img src={imageUrl} />
        )
    } else {
        return (
            // <img src={imageUrl} style="visibility: hidden"/>
            <span/>
        )
    }
}