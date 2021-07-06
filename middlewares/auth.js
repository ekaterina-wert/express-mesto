const jwt = require('jsonwebtoken');
const TokenError = require('../errors/unauthorized-error');
const ForbiddenError = require('../errors/forbidden-error');

const { JWT_SECRET = 'secret-key' } = process.env;

module.exports = function auth(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    throw new ForbiddenError('Необходима авторизация пользователя');
  }
  let payload;

  try {
    // верификация токена
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new TokenError('Передан некорректный токен');
  }

  req.user = payload; // пейлоуд в объект запроса

  next();
};
