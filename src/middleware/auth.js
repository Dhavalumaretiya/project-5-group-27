const jwt = require("jsonwebtoken");


const auth = function (req, res, next) {
    try {

        let token = req.headers['authorization'];

        if (typeof token === 'undefined') {
            return res.status(400).send({ status: false, message: "please enter token." });
        }
        let bearer = token.split(" ");
        let bearerToken = bearer[1];

        jwt.verify(bearerToken, "project-5-Products Management", function (err, data) {
            if (err) {
                return res.status(400).send({ status: false, message: "Invaild user" });
            } else {
                console.log(data)
                req.userId = data.userId
                next()
            }
        })
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
}

module.exports = { auth }