const express = require("express");

let {
	verificaToken,
	verificaAdminRole,
} = require("../middlewares/autenticacion");

let app = express();

let Categoria = require("../models/categoria");
let Usuario = require("../models/usuario");

// Mostrar todas las categorias

app.get("/categoria", verificaToken, (req, res) => {
	Categoria.find({})
		.sort("descripcion")
		.populate("usuario", "nombre email")
		.exec((err, categoriasDB) => {
			if (err) {
				return res.status(500).json({
					ok: true,
					err,
				});
			}

			res.json({
				ok: true,
				categorias: categoriasDB,
			});
		});
});

// Mostrar una categoria por id

app.get("/categoria/:id", verificaToken, (req, res) => {
	Categoria.findById(req.params.id, (err, categoria) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}
		if (!categoria) {
			res.status(404).json({
				ok: false,
				err: {
					message: "Categoria no encontrada.",
				},
			});
		}

		res.json({
			ok: true,
			categoria,
		});
	});
});

// crear una categoria

app.post("/categoria", verificaToken, (req, res) => {
	let body = req.body;

	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario: req.usuario._id,
	});

	categoria.save((err, categoriaDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "No se pudo crear la categoria",
				},
			});
		}

		res.json({
			ok: true,
			categoria: categoriaDB,
		});
	});
});

// Actializar categoria

app.put("/categoria/:id", (req, res) => {
	let id = req.params.id;
	let body = req.body;

	let categoriaDesc = {
		descripcion: body.descripcion,
	};

	Categoria.findByIdAndUpdate(
		id,
		categoriaDesc,
		{
			new: true,
			runValidators: true,
			context: "query",
		},
		(err, categoriaDB) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			if (!categoriaDB) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "No se pudo actualizar la categoria",
					},
				});
			}

			res.json({
				ok: true,
				categoria: categoriaDB,
			});
		}
	);
});

// Eliminar categoria

app.delete("/categoria/:id", [verificaToken, verificaAdminRole], (req, res) => {
	let id = req.params.id;

	Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "El id no existe!",
				},
			});
		}

		res.json({
			ok: true,
			message: "Categoria borrada",
		});
	});
});

module.exports = app;
