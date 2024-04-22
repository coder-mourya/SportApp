module.exports = (res, data, message, status = 200) => {
  if (data && data.isBoom && data.isBoom == true) {

     // Sends error to user
    res.status(200).json({
      errors: {
        msg: message
      },
      status: status
    })
  } else {
    const response = {
      status: status,
      message,
      data,
    };
    res.status(200).json(response);
  }
};


// /**
//  * Builds error object
//  * @param {number} code - error code
//  * @param {string} message - error text
//  */
// exports.buildErrObject = (code, message) => {
//   return {
//     code,
//     message
//   }
// }

// exports.handleError = (res, err) => {
//   // Prints error in console
//   if (process.env.NODE_ENV === 'development') {
//     dump(err)
//   }
//   // Sends error to user
//   res.status(err.code).json({
//     errors: {
//       msg: err.message
//     },
//     code: err.code
//   })
// }
