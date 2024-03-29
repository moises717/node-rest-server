//##############################
// Puerto
//##############################
process.env.PORT = process.env.PORT || 3000;

// #############################
//  Entorno
// ##############################
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// #############################
//  Vencimiento del token
// ##############################
process.env.CADUCIDAD_TOKEN = "48h";

// #############################
//  SEED de la autenticacion
// ##############################
process.env.SEED = process.env.SEED || "este-sf-sdfsdf-secret";

// #############################
//  Base de datos
// ##############################

let urlDB;

if (process.env.NODE_ENV === "dev") {
	urlDB = "mongodb://localhost:27017/cafe";
} else {
	urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// #############################
//  google client id
// ##############################

process.env.CLIENT_ID =
	process.env.CLIENT_ID ||
	"493015539710-lgao7gelvscchet15pfi81qr7rgfs1b3.apps.googleusercontent.com";
