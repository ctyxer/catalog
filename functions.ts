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
        addZero(date.getHours(), 2) +
        ":" +
        addZero(date.getMinutes(), 2) +
        " " +
        addZero(date.getDate(), 2) +
        "." +
        addZero(Number(date.getMonth() + 1), 2) +
        "." +
        date.getFullYear()
    );
}

export function getNavObj(req: Request){
    return {
        'username' : undefined
    } 
}