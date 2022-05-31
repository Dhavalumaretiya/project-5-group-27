
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0 ) return false
    return true
};

const validRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
};

const vaildObjectId = function (objectId) {
    if (objectId.length == 24) return true
    return false
};

const vaildQuantity = function isInteger(value){
    if(value<1) return false
  
    if(value % 1 ===0)  return true
};

const isValidStatus = function(status) {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
}


module.exports= {isValid,validRequestBody,vaildObjectId,vaildQuantity,isValidStatus}  