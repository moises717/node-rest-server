const express = require("express");

const bcrypt = require("bcrypt");

const _ = require("underscore");

const Usuario = require("../models/usuario");
const {
	verificaToken,
	verificaAdminRole,
} = require("../middlewares/autenticacion");

const app = express();

app.get("/usuario", verificaToken, (req, res) => {
	let desde = req.query.desde || 0;
	desde = Number(desde);

	let limite = req.query.limite || 5;
	limite = Number(limite);

	Usuario.find({ estado: true }, "_id nombre email estado google role")
		.skip(desde)
		.limit(5)
		.exec((err, usuarios) => {
			if (err) {
				return res.status(400).json({ ok: false, err });
			}

			Usuario.countDocuments({ estado: true }, (err, conteo) => {
				res.json({ ok: true, usuarios, cuantos: conteo });
			});
		});
});

app.post("/usuario", function (req, res) {
	let body = req.body;

	let usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role,
	});

	console.log(usuario);

	usuario.save((err, usuarioDB) => {
		if (err) {
			return res.status(400).json({ ok: false, err });
		}

		res.json({ ok: true, usuario: usuarioDB });
	});
});

app.put("/usuario/:id", verificaToken, function (req, res) {
	let id = req.params.id;
	let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

	Usuario.findByIdAndUpdate(
		id,
		body,
		{ new: true, runValidators: true },
		(err, usuarioDB) => {
			if (err) {
				return res.status(400).json({ ok: false, err });
			}

			res.json({
				ok: true,
				usuario: usuarioDB,
			});
		}
	);
});

app.delete(
	"/usuario/:id",
	[verificaToken, verificaAdminRole],
	function (req, res) {
		let id = req.params.id;
		let cambiaEstado = {
			estado: !req.body.estado || true,
		};

		Usuario.findByIdAndUpdate(
			id,
			cambiaEstado,
			{ new: true },
			(err, usuarioDelete) => {
				if (err) {
					return res.status(400).json({ ok: false, err });
				}

				if (!usuarioDelete) {
					return res
						.status(400)
						.json({ ok: false, err: { message: "Usuario no encontrado" } });
				}

				res.json({
					ok: true,
					usuario: usuarioDelete,
				});
			}
		);
	}
);

module.exports = app;
