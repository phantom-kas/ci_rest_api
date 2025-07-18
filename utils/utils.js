export const standardResponse = (res, status, data = undefined, message = undefined, messages = undefined, obj = undefined) => {
    // const statusString = '';
    res.status(status).json({
        status: getStatus(status), message, data, messages, ...obj
    })
}


const getStatus = (status) => {
    if (status >= 200 && status <= 300) {
        return 'success'
    }
    return 'error'
}


export const getDateTime = () => {
    const now = new Date();

    const pad = n => String(n).padStart(2, '0');

    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ` +
        `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}


export const getMonth = () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`;
}

export function getFutureTimeGMT(diff = 3600000) {
    const now = new Date();

    // Add 1 hour
    const future = new Date(now.getTime() + diff);

    // Get UTC parts
    const year = future.getUTCFullYear();
    const month = String(future.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(future.getUTCDate()).padStart(2, '0');
    const hours = String(future.getUTCHours()).padStart(2, '0');
    const minutes = String(future.getUTCMinutes()).padStart(2, '0');
    const seconds = String(future.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
}