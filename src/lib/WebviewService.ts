import { v4 as generateUUID } from "uuid"
import { useEffect, useState } from "preact/hooks";
import { Request, Return } from "../../types/pkg/types";

type Result<T, U> = { Ok: T, Err: null } | { Ok: null, Err: U }

class WebviewMessage<T> {
    subscription_id: string;
    message_id: string;
    inner: T;

    constructor(subscription_id: string, inner: T) {
        this.subscription_id = subscription_id;
        this.message_id = generateUUID();
        this.inner = inner;
    }
}

class WebviewService {
    private subscription_id = generateUUID();

    // private handler: (content: any) => any;
    // private unwrapper: (content: any) => any; // Is the unwrapper still usable?

    private sent_messages: { [messageId: string]: { event_listener: EventListener } } = {};

    private queue: (fn: () => any) => Promise<Return>;

    private invoke = <M>(arg: WebviewMessage<M>) => {
        (window as any).external.invoke(JSON.stringify(arg));
    }

    private getPromiseAndInvoke = (request: Request) => {
        let message = new WebviewMessage(this.subscription_id, request)

        if((request as Partial<Return>).fields !== undefined) {
            const promise: Promise<Return> = new Promise((resolve, reject) => {
                let event_listener = ((response: CustomEvent) => {
                    if(response.detail.messageId == message.message_id) {
                        // Clean up event listener
                        document.removeEventListener(this.subscription_id, this.sent_messages[message.message_id].event_listener)
                        delete this.sent_messages[message.message_id]

                        // Process the Result from rust
                        const result = response.detail.inner as Result<Return, string>

                        if(result.Ok) {
                            resolve(result.Ok)
                        } else {
                            reject(result.Err)
                        }
                    }
                }) as EventListener

                this.sent_messages[message.message_id] = { event_listener: event_listener }

                document.addEventListener(this.subscription_id, event_listener)
            });

            this.invoke(message);
            return promise;
        } else {
            this.invoke(message);
        }
    }

    /**
     * Sends a request to the backend
     */
    send = (closure: () => Request) => {
        // TODO: Return the type::Return and a type guard to validate it?
        return this.queue(async () => {
            return await this.getPromiseAndInvoke(closure())
        })
    }

    private createPromiseQueue = () => {
        let p: Promise<any> = Promise.resolve()
        return (fn: (request: Request) => any) => {
            p = p.then(fn);
            return p
        }
    }

    /**
     * Removes the event listener added by the constructor. This should be called whenever a component unrenders.
     * You should not need to call this if you are using the `useWebviewService` hook
     */
    drop = () => {
        for(var key of Object.keys(this.sent_messages)) {
            document.removeEventListener(this.subscription_id, this.sent_messages[key].event_listener)
            delete this.sent_messages[key]
        }
    }
  
    constructor(/*handler: (content: any) => void, unwrapper: (event: CustomEvent) => any*/) {
        // this.handler = handler;
        // this.unwrapper = unwrapper;
        this.queue = this.createPromiseQueue();
    }
}

// TODO: Remove narrowReturnType, implement my own TS type generating macro
// This function no longer provides any benefit
// 
// export const narrowReturnType = (detail: Partial<Return>) => {
//     if(detail.tag === 'open') {
//         return detail.fields
//     } else if (detail.tag === 'openDir') {
//         return detail.fields
//     } else if(detail.tag === 'echo') {
//         return detail.fields
//     } else if(detail.tag === 'boardString') {
//         return detail.fields
//     } else if(detail.tag === 'legalMoves'){
//         return detail.fields
//     } else {
//         return null
//     }
// }

/**
 * Returns a WebviewService instance
 */
// export function useWebviewService(): WebviewService;

/**
 * Returns a WebviewService instance
 * @param handler A function to handle responses from the backend. Should return the value to be recieved by `service.send`
 */
// export function useWebviewService(handler: (content: Return) => any): WebviewService;

/**
 * Returns a WebviewService instance
 * @param handler A function to handle responses from the backend. Should return the value to be recieved by `service.send`
 * @param unwrapper Optional function to expose the CustomEvent received from the backend. Should return the value that is passed to `handler` as `content`
 */
// export function useWebviewService<T>(handler: (content: T) => any, unwrapper: (event: CustomEvent) => T): WebviewService;

/**
 * Returns a WebviewService instance
 */
export function useWebviewService(/*handler?: (content: Return) => any, unwrapper?: (event: CustomEvent) => Return*/): WebviewService {
    // const defaultUnwrapper = (event: CustomEvent) => {
    //     return event.detail.inner as Return
    // }

    // unwrapper = unwrapper ? unwrapper : defaultUnwrapper
    // handler = handler ? handler : narrowReturnType

    // const service = new WebviewService(handler, unwrapper)
    const service = new WebviewService()
    useEffect(() => {

        return () => {
            service.drop()
        }
    }, [])
    return service
}

/**
 * Wraps the useState hook in order to resolve concurrency issues when changing state based on calls to the rust backend
 */
export const useBoxedState = <S>(initialState: S | (() => S)): [{value: S}, (value: S | ((prevState: S) => S)) => void] => {
    const [internalState, setInternalState] = useState(initialState)
    const box = { value: internalState }

    const setExternalState = (value: S | ((prevState: S) => S)) => {
        // if(value instanceof Function) {
        //     box.value = value(box.value);
        // } else {
        //     box.value = value
        // }
        setInternalState(value)
        box.value = internalState // TODO: Test that this works
    }

    return [box, setExternalState]
}
