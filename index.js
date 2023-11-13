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

let All_id_Array = []


io.on("connection", (socket) => {
	All_id_Array.push(socket.id)
	socket.on('newly_joined',()=>{
		io.emit('newly_joined',All_id_Array);
		console.log(All_id_Array)
	})
	socket.emit('newly_joined',All_id_Array);
	console.log(socket.id,"connected")
	socket.emit("me", socket.id);
	

	socket.on("disconnect", () => {
        console.log(`${socket.id} is disconnected.`);
		const index = All_id_Array.indexOf(socket.id);
		All_id_Array.splice(index,1)
		io.emit("newly_joined", All_id_Array);
    });

	socket.on('ENDCALL',(idToEndCall)=>{
		io.to(idToEndCall).emit('ENDCALL',(idToEndCall))
	})

	socket.on("CallUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("getCalls", { signal: signalData, from, name });
	});

	socket.on("AnswerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
        // console.log(data.to)
		// const index = All_id_Array.indexOf(data.to);
		// All_id_Array.splice(index,1)
	});
});


server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));