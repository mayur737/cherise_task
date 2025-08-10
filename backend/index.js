const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./stduent.route");

const app = express();
app.use(express.json());

app.use(cors());

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
