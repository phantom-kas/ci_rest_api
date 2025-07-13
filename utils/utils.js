export const standardResponse = (res, status, data = undefined, message = undefined, messages = undefined,obj=undefined) => {
    // const statusString = '';
    res.status(status).json({
        status:getStatus(status), message, data, messages,...obj
    })
}


const getStatus = (status)=>{
    if(status >= 200 && status <= 300){
        return 'success'
    }
    return 'error'
}


export const getDateTime = ()=>{
     const now = new Date();

  const pad = n => String(n).padStart(2, '0');

  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ` +
         `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}