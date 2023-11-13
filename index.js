const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	console.log(socket.id,"connected")
	socket.emit("me", socket.id);

	socket.on("diconnected",()=>{
		console.log(socket.id,"disconnected");
	})

	socket.on('ENDCALL',(idToEndCall)=>{
		io.to(idToEndCall).emit('ENDCALL',(idToEndCall))
	})

	socket.on("CallUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("getCalls", { signal: signalData, from, name });
	});

	socket.on("AnswerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
        console.log(data)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));