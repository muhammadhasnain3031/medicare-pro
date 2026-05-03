import jsPDF from 'jspdf';

export const generateInvoice = async ({ orderId, amount }: any) => {

  const doc = new jsPDF();

  const invoiceId = "INV-" + Date.now();

  doc.setFontSize(16);
  doc.text("Hospital Invoice", 10, 10);

  doc.setFontSize(12);
  doc.text(`Invoice ID: ${invoiceId}`, 10, 25);
  doc.text(`Order ID: ${orderId}`, 10, 35);
  doc.text(`Amount Paid: Rs ${amount}`, 10, 45);

  doc.text("Status: PAID", 10, 60);

  const fileName = `${invoiceId}.pdf`;
  doc.save(fileName);

  return {
    id: invoiceId,
    file: fileName,
    amount
  };
};