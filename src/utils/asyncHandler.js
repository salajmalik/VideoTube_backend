const asyncHandler = (requestHandler) =>{
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
        //If requestHandler is not a promise, Promise.resolve() converts it to a promise and then we can use .then().catch()
    }
}


// This will be the function if we are using try catch syntax
// const asyncHandler = (requestHandler) => async(req, res, next)=>{  // same as returning a function
//     try{
//         await requestHandler(req,res, next)
//     } catch(err) {
//         console.log(err.code || 500)
//     }
// }

export {asyncHandler}  //wrapper function to access database