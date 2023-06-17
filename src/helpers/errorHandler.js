export default async function errorHandler(err, req, res, next) {
    if (err)
        logger.error(`An error occurred: ${err.message}`);
    next()
};