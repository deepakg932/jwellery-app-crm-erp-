const getBaseUrl = (req) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  return `${req.protocol}://${req.get("host")}`;
};


export default getBaseUrl;