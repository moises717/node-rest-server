const express = require("express");
const fs = require("fs");
const path = require("path");

const { verificaTokenImg } = require("../middlewares/autenticacion");

let app = express();

app.get("/imagen/:tipo/:img", verificaTokenImg, (req, res) => {
	let { tipo, img } = req.params;

	let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
	let pathnoimg = path.resolve("server/assets/no-image.jpg");

	if (fs.existsSync(pathImagen)) {
		res.sendFile(pathImagen);
	} else {
		res.sendFile(pathnoimg);
	}
});

module.exports = app;
