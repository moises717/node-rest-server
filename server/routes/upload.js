const express = require("express");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const app = express();

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

app.use(fileUpload());

app.put("/upload/:tipo/:id", function (req, res) {
	let { tipo, id } = req.params;

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "No se ha selecionado ningun archivo.",
			},
		});
	}

	// Validar tipo

	let tiposValidos = ["productos", "usuarios"];

	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "Los tipos permitidos son: " + tiposValidos.join(", "),
			},
		});
	}

	let archivo = req.files.archivo;

	///Extensiones permitidas

	let extensiones = ["png", "jpg", "PNG", "JPG", "jpeg", "JPEG", "GIF", "gif"];

	let nombreCortado = archivo.name.split(".");

	let ext = nombreCortado[nombreCortado.length - 1];

	if (extensiones.indexOf(ext) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "Las extesiones permitidas son: " + extensiones.join(", "),
				ext,
			},
		});
	}

	// Cambiar nombre al archivo

	let nombreArchivo = `${id}-${new Date().getMilliseconds()}-.${ext}`;

	archivo.mv(path.resolve(`uploads/${tipo}/${nombreArchivo}`), (err) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err: err,
			});
		}

		// Imagen cargada
		if (tipo === "usuarios") {
			imagenUsuario(id, res, nombreArchivo);
		} else {
			imagenProducto(id, res, nombreArchivo);
		}
	});
});

function imagenUsuario(id, res, nombreArchivo) {
	Usuario.findById(id, (err, usuarioDB) => {
		if (err) {
			borraArchivo(nombreArchivo, "usuarios");
			return res.status(500).json({
				ok: false,
				err: err,
			});
		}

		if (!usuarioDB) {
			borraArchivo(nombreArchivo, "usuarios");
			return res.status(400).json({
				ok: false,
				err: {
					message: "Usuario no existe.",
				},
			});
		}

		borraArchivo(usuarioDB.img, "usuarios");

		usuarioDB.img = nombreArchivo;

		usuarioDB.save((err, usuarioSaved) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err: err,
				});
			}

			res.json({
				ok: true,
				usuario: usuarioSaved,
				img: nombreArchivo,
			});
		});
	});
}

function imagenProducto(id, res, nombreArchivo) {
	Producto.findById(id, (err, productoDB) => {
		if (err) {
			borraArchivo(nombreArchivo, "productos");
			return res.status(500).json({
				ok: false,
				err: err,
			});
		}

		if (!productoDB) {
			borraArchivo(nombreArchivo, "productos");
			return res.status(400).json({
				ok: false,
				err: {
					message: "El producto no existe.",
				},
			});
		}

		borraArchivo(productoDB.img, "productos");

		productoDB.img = nombreArchivo;

		productoDB.save((err, productoSaved) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err: err,
				});
			}

			res.json({
				ok: true,
				producto: productoSaved,
				img: nombreArchivo,
			});
		});
	});
}

function borraArchivo(nombreImagen, tipo) {
	let pathImagen = path.resolve(
		__dirname,
		`../../uploads/${tipo}/${nombreImagen}`
	);

	if (fs.existsSync(pathImagen)) {
		fs.unlinkSync(pathImagen);
	}
}

module.exports = app;
