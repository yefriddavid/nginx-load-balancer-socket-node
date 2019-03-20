const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')
const os = require("os");
const hostname = os.hostname();

const redis = require('redis'),
      redisAdapter = require('socket.io-redis'),
      port = 6379,
      host = 'redis',
      pub = redis.createClient(port, host),
      sub = redis.createClient(port, host, {detect_buffers: true}),
      socketServer = io(http, {adapter: redisAdapter({pubClient: pub, subClient: sub})})


const PORT = 80

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/broadcast', (req, res) => {
	socketServer.to('milkyway').emit('chatmessage', {message: "Hello everybody!", server: hostname})
	// socketServer.broadcast('milkyway'.emit("holaaaaaaaaaa"))
  res.send(`Message sent to everybody! ${hostname}`)
})

app.get('/sendTo', (req, res) => {
	socketServer.to(req.query.nickname).emit('chatmessage', {message: `Hello:  ${req.query.nickname}`, server: hostname})
	// socketServer.broadcast('milkyway'.emit("holaaaaaaaaaa"))
  res.send(`Message sent to! ${req.query.nickname} throw: ${hostname}`)
})

socketServer.on('connection', socket => {
  socket.on('joinToMilky', _ =>{
    socket.join(`milkyway`)
  })
  socket.on('joinMyNickname', nickname =>{
    socket.join(nickname)
  })
  socket.on('disconnect', _ => {
    console.log('user disconnected')
  })
  socket.on('chatmessage', msg =>{
    socketServer.emit('chatmessage', { message: msg, date: "here we go", server: hostname});
  })
  socket.on('message', msg =>{
    console.log('new message')
    socketServer.emit('message', msg)
  })
})


http.listen(PORT, _ => {
  console.log(`listening on *:${PORT}`)
})


