var express = require('express')
var bodyParser = require('body-parser')
var rabbitMQHandler = require('./connection')

var app = express()
var router = express.Router()
var server = require('http').Server(app)
// var socketIO = require('socket.io')(server)

// var calcSocket = socketIO.of('/calc')

rabbitMQHandler((connection) => {
  connection.createChannel((err, channel) => {
    if (err) {
      throw new Error(err);
    }
    // var mainQueue = 'calc_sum'
    // var mainQueue = 'test-exchange'
    var mainExchange = 'test-exchange'

    channel.assertQueue('', {exclusive: true}, (err, queue) => {
      if (err) {
        throw new Error(err)
      }
      channel.bindQueue(queue.queue, mainExchange, '')
      channel.consume(queue.que, (msg) => {
        var result = JSON.stringify({result: Object.values(JSON.parse(msg.content.toString()).task).reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue))});
        // calcSocket.emit('calc', result)
        console.log('Result to send to socket (disabled): ', result);
      })
    }, {noAck: true})
  })
})

app.use(bodyParser.urlencoded({extended: true}))
app.use('/api', router)
router.route('/calc/sum').post((req, res) => {
  rabbitMQHandler((connection) => {
    connection.createChannel((err, channel) => {
      if (err) {
        throw new Error(err)
      }
      // var ex = 'calc_sum'
      // var ex = '';  // connect to `default` exchange
      var ex = 'first-queue';

      // var msg = JSON.stringify({task: req.body});
      var msg = 'hello, world!!!!!';

      let messagesPublished = 0;
      const intervalId = setInterval(() => {
        console.log(`publishing message ${messagesPublished + 1}`);
        channel.publish(ex, '', new Buffer(`${msg} - ${messagesPublished++}`), {persistent: true});
        if (messagesPublished > 10) {
          clearInterval(intervalId);
        }
      }, 1000);
      // channel.publish(ex, '', new Buffer(msg), {persistent: false})
      // channel.publish(ex, '', new Buffer(msg), {persistent: true})
      // channel.publish(mainExchange, '', new Buffer(msg), {persistent: false})

      channel.close(() => {
        connection.close()
      })
    })
  })
})

server.listen(5555, '0.0.0.0',
  () => {
    console.log('Running at at localhost:5555')
  }
)
