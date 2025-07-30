const fs = require("fs");

const filePath = "./AQ_TRANSPARENT_LOGO.png";
const image = fs.readFileSync(filePath);
const base64 = `data:image/png;base64,${image.toString("base64")}`;

// Write to a file
fs.writeFileSync("logo.txt", base64);

console.log("Base64 string written to logo.txt");
