import session from "express-session"

declare module 'express-session' {
    export interface SessionData {
        auth: boolean,
        username: string
    }
}