const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(403).send({ message: 'authorization needed' })
  }
  const token = authorization.replace('Bearer ', '');
  // return res.send(token);
  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'key');
  } catch (err) {
    return res.status(401).send({ message: 'no token' });
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next();
}