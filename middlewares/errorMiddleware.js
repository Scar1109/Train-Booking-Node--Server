const errorMiddleware = (err, req, res, next) => {
    console.error(err.message || err);
    res.status(500).json({ msg: "Server Error" });
};

module.exports = errorMiddleware;
