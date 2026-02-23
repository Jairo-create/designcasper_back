
const axios = require("axios");
const fs = require("fs");

const downloadImage = async (url, filepath) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filepath, response.data);
};

module.exports = downloadImage;