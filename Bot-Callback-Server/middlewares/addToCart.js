module.exports = (req, res, next) => {
    let payload = JSON.parse(req.body.payload);
    if (payload.callback_id !== 'add to cart') {
        next();
        return
    }

    console.log(payload);

    next();
}