import bwipjs from "bwip-js";

export const generateBarcodeBuffer = async (text) => {
  return await bwipjs.toBuffer({
    bcid: "code128",     // barcode type (best & common)
    text: text,          // ITM-0003
    scale: 3,            // size
    height: 10,          // bar height
    includetext: true,   // barcode ke niche text
    textxalign: "center",
  });
};
