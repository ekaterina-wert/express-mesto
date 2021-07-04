const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const NotFoundError = require('../errors/not-found-error');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => validator.isURL(v, { protocols: ['http', 'https'], require_tld: true, require_protocol: true }),
      message: 'Неправильно передана ссылка на изображение',
    },
  },
});

userSchema.statics.findUserByCredentials = function checkUser(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) throw new NotFoundError('Юзер с таким имейлом отсутствует');
      // return Promise.reject(new NotFoundError('Юзер с таким имейлом отсутствует'));
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) throw new NotFoundError('Введен неверный пароль');
          // return Promise.reject(new NotFoundError('Введен неверный пароль'));
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
