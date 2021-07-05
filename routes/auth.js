const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { login, createUser } = require('../controllers/users');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(3),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/https?:\/\/[0-9a-zA-Z\-._~:/?#[\]@!$&'()*+,;=]{2,}\.[0-9a-zA-Z\-._~:/?#[\]@!$&'()*+,;=]{2,}/),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(5),
    password: Joi.string().required().min(3),
  }),
}), login);

module.exports = router;
