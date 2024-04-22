var bcrypt = require('bcrypt');
const {dump} = require("../services/dump");

module.exports = {
    /**
     * Checks is password matches
     * @param {string} password - password
     * @param {Object} user - user object
     * @returns {boolean}
     */
    async checkPassword(password, user) {
      return new Promise((resolve, reject) => {
        if (bcrypt.compareSync(password, user.password)) { //if matched successfully
          resolve(true)
        } else {
          resolve(false)
        }
      })
    },
  }
  