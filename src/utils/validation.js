


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
}
// const isValidObjId = (objectId) => {
//     return mongoose.Types.ObjectId.isValid(objectId);
//   }
// const isValidNum = (num) => {
//     return /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(num);
// }

module.exports= {isValid,validRequestBody,vaildObjectId,vaildQuantity}  