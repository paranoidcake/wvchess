import { h } from 'preact'
import './test.css'
import { classNames } from './styles'

export const Test = () => {
    return (
        <div className={classNames.test}>
            <p>Test</p>
        </div>
    )
}