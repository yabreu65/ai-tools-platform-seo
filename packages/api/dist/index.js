"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes")); // ✅
const connect_1 = require("./db/connect");
const app = (0, express_1.default)();
// Conectar a MongoDB Atlas
(0, connect_1.connectDB)();
app.use((0, morgan_1.default)('tiny'));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// ✅ Montás el router que engloba todo
app.use('/api', routes_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🔥 Servidor backend Node corriendo en http://localhost:${PORT}`);
});
