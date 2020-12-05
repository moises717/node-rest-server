const express = require("express");

const { verificaToken } = require("../middlewares/autenticacion");

let app = express();
let Producto = require("../models/producto");

//############################
// Obtener todos los productos
//############################

app.get("/productos", verificaToken, (req, res) => {
	let desde = req.query.desde || 0;
	desde = Number(desde);

	Producto.find({ disponible: true })
		.skip(desde)
		.limit(5)
		.populate("usuario", "nombre email")
		.populate("categoria", "descripcion")
		.exec((err, productos) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				productos: productos,
			});
		});
});

//############################
// Obtener producto por id
//############################

app.get("/productos/:id", verificaToken, (req, res) => {
	let id = req.params.id;

	Producto.findById(id)
		.populate("usuario", "nombre email")
		.populate("categoria", "descripcion")
		.exec((err, productoDB) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}
			if (!productoDB) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "ID Producto no existe.",
					},
				});
			}

			res.json({
				ok: true,
				producto: productoDB,
			});
		});
});

//############################
// Crear nuevo producto
//############################

app.post("/productos", verificaToken, (req, res) => {
	let { nombre, precioUni, categoria } = req.body;

	let producto = new Producto({
		usuario: req.usuario._id,
		nombre,
		precioUni,
		categoria: categoria,
	});
	console.log(categoria);
	producto.save((err, productoDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		res.status(201).json({
			ok: true,
			producto: productoDB,
		});
	});
});

//############################
// Actualizar producto
//############################

app.put("/productos/:id", verificaToken, (req, res) => {
	let id = req.params.id;
	let body = req.body;

	Producto.findById(id, (err, productoDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}
		if (!productoDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "El id no existe.",
				},
			});
		}
		productoDB.nombre = body.nombre;
		productoDB.precioUni = body.precioUni;
		productoDB.categoria = body.categoria;
		productoDB.disponible = body.disponible;
		productoDB.descripcion = body.descripcion;

		productoDB.save((err, productoSaved) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				producto: productoSaved,
			});
		});
	});
});

//############################
// Borrar producto
//############################

app.delete("/productos/:id", verificaToken, (req, res) => {
	let { id } = req.params;

	Producto.findById(id, (err, productoDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}
		if (!productoDB) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}
		productoDB.disponible = false;
		productoDB.save((err, productoSaved) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				producto: productoSaved,
				message: "Producto borrado.",
			});
		});
	});
});

//############################
// Buscar productos
//############################

app.get("/productos/buscar/:termino", verificaToken, (req, res) => {
	let { termino } = req.params;

	let regex = new RegExp(termino, "i");

	Producto.find({ nombre: regex })
		.populate("categoria", "nombre")
		.exec((err, productoDB) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				productos: productoDB,
			});
		});
});

module.exports = app;
