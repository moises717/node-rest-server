require("./config/config");
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());

// Cofiguracion global de rutas
app.use(require("./routes/index"));

mongoose.connect(
	process.env.URLDB,
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
