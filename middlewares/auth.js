const jwt = require('jsonwebtoken');
const TokenError = require('../errors/token-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports = function auth(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ForbiddenError('Необходима авторизация пользователя');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'key');
  } catch (err) {
    throw new TokenError('Передан некорректный токен');
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next();
};
