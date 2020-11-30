const express = require("express");
const app = express();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

app.post("/login", (req, res) => {
	let { email, password } = req.body;

	Usuario.findOne({ email: email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({ ok: false, err });
		}

		if (!usuarioDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "(Usuario) o contraseña incorrectos.",
				},
			});
		}

		if (!bcrypt.compareSync(password, usuarioDB.password)) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "Usuario o (contraseña) incorrectos.",
				},
			});
		}

		let token = jwt.sign(
			{
				usuario: usuarioDB,
			},
			process.env.SEED,
			{ expiresIn: process.env.CADUCIDAD_TOKEN }
		);

		res.json({
			ok: true,
			Usuario: usuarioDB,
			token,
		});
	});
});

module.exports = app;
