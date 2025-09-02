import dotenv from 'dotenv';
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
console.log(' envpath = ',envFile)
dotenv.config({ path: envFile });
import app from "./server.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on port " + PORT));