import { Request } from 'express';

export function stringData(data: string | String | number | Number) {
    let date = new Date(Number(data));
    function addZero(number: number, col: number) {
        if (Number(col) - Number(String(number).length) >= 0) {
            return "0".repeat(Number(col) - Number(String(number).length)) + number;
        }
        else {
            return number;
        }
    }
    return String(
        `${date.getFullYear()}.${addZero(Number(date.getMonth() + 1), 2)}.${addZero(date.getDate(), 2)} ${addZero(date.getHours(), 2)}:${addZero(date.getMinutes(), 2)}`
    );
}

export function renderObject(req: Request, obj?: Object | object){
    if(req.session.messageAlert != undefined){
        let messageAlert = req.session.messageAlert;
        req.session.messageAlert = undefined;
        return {
            ...{
                'auth': req.session.auth,
                'message': messageAlert
            },
            ...obj
        }
    }

    return {
        ...{
            'auth': req.session.auth
        },
        ...obj
    }
}