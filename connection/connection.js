var amqp = require('amqplib/callback_api')
module.exports = (callback) => {
  // amqp.connect('amqp://user:user@whateverhost:whateverport',
  // amqp.connect('amqp://localhost:15672',
  amqp.connect('amqp://localhost',
  // amqp.connect('amqp://guest:guest@localhost:15672',
    (error, conection) => {
      if (error) {
        throw new Error(error);
      }

      callback(conection);
    })
}
