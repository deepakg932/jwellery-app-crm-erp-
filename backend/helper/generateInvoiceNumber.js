import Invoice from "../Models/models/Invoice.js";

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  // 🔥 last invoice nikalo
  const lastInvoice = await Invoice.findOne({
    invoice_number: new RegExp(`^INV-${year}-`)
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastNum = parseInt(
      lastInvoice.invoice_number.split("-").pop()
    );
    nextNumber = lastNum + 1;
  }

  // INV-2026-00001
  return `INV-${year}-${String(nextNumber).padStart(5, "0")}`;
};
