const SHORT_URL_LENGTH = 6;
const SHORT_URL_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

export const generateShortCode = (): string => {
  let code = "";
  for (let i = 0; i < SHORT_URL_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * SHORT_URL_CHARSET.length);
    code += SHORT_URL_CHARSET[randomIndex];
  }
  return code;
};
