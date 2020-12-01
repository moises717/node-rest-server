const express = require("express");
const app = express();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require("../models/usuario");
const { json } = require("body-parser");

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

// Configuraciones de google
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
	};
}

app.post("/google", async (req, res) => {
	let token = req.body.idtoken;

	let googleUser = await verify(token).catch((err) => {
		return res.status(403).json({
			ok: false,
			err: err,
		});
	});

	Usuario.findOne({ email: googleUser.email }, (err, userDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}
		if (userDB) {
			if (userDB.google === false) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "Debes autenticarte con tus datos de registro",
					},
				});
			} else {
				let token = jwt.sign(
					{
						usuario: userDB,
					},
					process.env.SEED,
					{ expiresIn: process.env.CADUCIDAD_TOKEN }
				);

				return res.json({
					ok: true,
					usuario: userDB,
					token,
				});
			}
		} else {
			// Si el usuario no existe en la base de datos
			let usuario = new Usuario();
			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = ":)";

			usuario.save((err, usuarioDB) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						err,
					});
				}
				let token = jwt.sign(
					{
						usuario: usuarioDB,
					},
					process.env.SEED,
					{ expiresIn: process.env.CADUCIDAD_TOKEN }
				);

				return res.json({
					ok: true,
					usuario: usuarioDB,
					token,
				});
			});
		}
	});
});

module.exports = app;
