require("./config/config");
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());

app.use(require("./routes/usuario"));

mongoose.connect(
	"mongodb://localhost:27017/cafe",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	},
	(err, res) => {
		if (err) throw new err();
		console.log("Base de datos conectada");
	}
);

app.listen(process.env.PORT, () => {
	console.log("Escuchando puerto:", process.env.PORT);
});
