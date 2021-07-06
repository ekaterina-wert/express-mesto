const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');
const BadRequestError = require('../errors/bad-request-error');

const { OK } = require('../utils/constants');

const { JWT_SECRET = 'secret-key' } = process.env;

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id }, // пейлоуд токена
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .end();
    })
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestError('Переданы некорректные данные'));
      next(err);
    });
};

// Получить список пользователей
const getUsers = (req, res, next) => User.find({})
  .then((users) => res.status(OK).send(users))
  .catch(next);

// Получить пользователя по id
const getAnyUser = (req, res, next) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => {
      if (user) res.status(OK).send(user);
      throw new NotFoundError('Пользователь с указанным _id не найден');
    })
    .catch(next);
};

// Перейти на страницу зарегистрированного пользователя
const getUser = (req, res, next) => User.findById(req.user._id)
  .then((user) => res.status(OK).send({ user }))
  .catch(next);

// Создать нового пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))

    .then((user) => res.status(OK).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) next(new ConflictError('Юзер с таким имейлом уже существует'));
      if (err.name === 'ValidationError') next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      next(err);
    });
};

// Изменить информацию о пользователе
const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.status(OK).send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestError('Переданы некорректные данные'));
      next(err);
    });
};

// Изменить аватар пользователя
const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.status(OK).send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestError('Переданы некорректные данные'));
      next(err);
    });
};

module.exports = {
  login,
  getUsers,
  getAnyUser,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
};
