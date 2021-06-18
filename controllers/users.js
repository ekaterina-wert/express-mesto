const User = require('../models/user');

getUsers = (req, res) => {
  return User.find({})
    .then(users => res.status(200).send({ data: users }))
    .catch(err => res.status(500).send({ message: err.message }));
};

getUser = (req, res) => {
  const {id} = req.params;

  return User.findById(id)
    .then(user => {
      if (user) {
        return res.status(200).send({ data: user })
      }
      return res.status(404).send({ message: err.message }) //'Пользователь с таким ID отсутсвует'
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

createUser = (req, res) => {
  const {name, about, avtar} = req.body;

  return User.create({name, about, avtar})
    .then(user => res.status(200).send({ data: user }))
    .catch(err => res.status(500).send({ message: err.message }));
};

module.exports = {
  getUsers,
  getUser,
  createUser
}