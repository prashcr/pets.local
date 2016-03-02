const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid input for integer field' })
  }
  res.status(err.statusCode || 500).json({ error: err })
}

const getLimit = query => {
  const limit = +query.limit
  if (!Number.isInteger(limit) || limit > 50) return 50
  return limit
}

const getOffset = query => {
  const offset = +query.offset
  if (!Number.isInteger(offset)) return 0
  return offset
}

module.exports = {logErrors, errorHandler, getLimit, getOffset}
