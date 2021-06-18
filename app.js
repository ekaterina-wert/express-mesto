const path = require('path');
const express = require('express');
const mongoose = require("mongoose");
//const routers = require('./routes')
//const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

//app.use(express,static(path.join(__dirname, 'public')));

//app.use(routes);

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.user = {
    _id: '60cb1d35d8fc0600f04b0da0'
  };

  next();
})

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));



app.get('/', (req, res) => {
  res.send('it works')
})

app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`);
})



