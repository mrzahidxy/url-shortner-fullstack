// Configuration constants
const SHORT_URL_LENGTH = 6;
const SHORT_URL_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Helper function to validate a URL
function isValidUrl(url) {
  try {
    new URL(url); // throws if invalid
    return true;
  } catch (err) {
    return false;
  }
}

// Helper function to generate a random short URL code
function generateShortCode() {
  let code = "";
  for (let i = 0; i < SHORT_URL_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * SHORT_URL_CHARSET.length);
    code += SHORT_URL_CHARSET[randomIndex];
  }
  return code;
}

module.exports = {
  isValidUrl,
  generateShortCode,
};
