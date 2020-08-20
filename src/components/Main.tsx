import { h } from "preact";
import { useWebviewService } from "../WebviewService";
import { Board } from "./Board";

export const Main = () => {
    const service = useWebviewService()

    return (
        <div>
            <Board />
        </div>
    )
}