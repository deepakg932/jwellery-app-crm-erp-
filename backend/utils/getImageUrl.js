export const getImageUrl = (req, folder, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
};
