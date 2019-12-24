let express = require('express');

module.exports = function users() {

    let api = express.Router();
    api.get('/:lang/dummy-api', (req, res) => {
        try {
            res.send("here is the result")
        } catch (e) {
            res.send("error occured", e);

        }
    });
    //---------------------------------------------------------------------------------

    return api;
};