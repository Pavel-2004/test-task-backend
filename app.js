const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const githubRouter = require('./routes/github.js');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/github', githubRouter);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.log(err);
  })



app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})