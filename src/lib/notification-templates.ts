export const NotificationTemplates = {

  appointmentConfirmed: (
    patientName: string,
    doctorName:  string,
    date:        string,
    time:        string
  ) => `🏥 *MediCare Pro*

✅ *Appointment Confirmed!*

Hello ${patientName},

Your appointment has been confirmed:
👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${date}
⏰ Time: ${time}

Please arrive 10 minutes early.

_MediCare Pro — Your Health, Our Priority_`.trim(),

  appointmentReminder: (
    patientName: string,
    doctorName:  string,
    date:        string,
    time:        string
  ) => `🏥 *MediCare Pro*

⏰ *Appointment Reminder*

Hello ${patientName},

Reminder for your appointment:
👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${date}
⏰ Time: ${time}

Please bring your previous reports.

_MediCare Pro_`.trim(),

  appointmentCancelled: (
    patientName: string,
    doctorName:  string,
    date:        string
  ) => `🏥 *MediCare Pro*

❌ *Appointment Cancelled*

Hello ${patientName},

Your appointment with Dr. ${doctorName} on ${date} has been cancelled.

To reschedule, please contact reception.

_MediCare Pro_`.trim(),

  labReportReady: (
    patientName: string,
    testName:    string
  ) => `🏥 *MediCare Pro*

🧪 *Lab Report Ready!*

Hello ${patientName},

Your lab report is ready:
📋 Test: ${testName}

Please login to patient portal to view your report.

_MediCare Pro Laboratory_`.trim(),

  billGenerated: (
    patientName: string,
    invoiceNo:   string,
    amount:      number,
    dueDate:     string
  ) => `🏥 *MediCare Pro*

💰 *Invoice Generated*

Hello ${patientName},

Your invoice has been generated:
📋 Invoice: ${invoiceNo}
💵 Amount: PKR ${amount.toLocaleString()}
📅 Due Date: ${dueDate}

Payment: JazzCash, EasyPaisa or Cash at reception.

_MediCare Pro Billing_`.trim(),

  paymentReceived: (
    patientName: string,
    amount:      string | number,
    method?:     string,
    invoiceNo?:  string
  ) => `🏥 *MediCare Pro*

✅ *Payment Received*

Hello ${patientName},

Your payment has been received:
💵 Amount: PKR ${typeof amount === 'number' ? amount.toLocaleString() : amount}
${method    ? `💳 Method: ${method}`       : ''}
${invoiceNo ? `📋 Invoice: ${invoiceNo}`   : ''}

Thank you!

_MediCare Pro_`.trim(),

  prescriptionReady: (
    patientName: string,
    doctorName?: string
  ) => `🏥 *MediCare Pro*

💊 *Prescription Ready*

Hello ${patientName},

${doctorName ? `Dr. ${doctorName} has` : 'Your doctor has'} written a prescription for you.

Please login to patient portal to view your prescription.

_MediCare Pro_`.trim(),

  dueBillReminder: (
    patientName: string,
    invoiceNo:   string,
    dueAmount:   number,
    dueDate:     string
  ) => `🏥 *MediCare Pro*

⚠️ *Payment Due Reminder*

Hello ${patientName},

Outstanding payment:
📋 Invoice: ${invoiceNo}
💵 Due Amount: PKR ${dueAmount.toLocaleString()}
📅 Due Date: ${dueDate}

Please clear dues to avoid inconvenience.

_MediCare Pro Billing_`.trim(),

  welcomePatient: (
    patientName: string
  ) => `🏥 *MediCare Pro*

👋 *Welcome!*

Hello ${patientName},

Welcome to MediCare Pro! Your patient account has been created.

You can now:
📅 Book appointments online
💊 View prescriptions
🧪 Check lab reports
💰 Pay bills online

_MediCare Pro — Your Health, Our Priority_`.trim(),

  pharmacyBillReady: (
    patientName: string,
    billNo:      string,
    amount:      number
  ) => `🏥 *MediCare Pro Pharmacy*

🧾 *Pharmacy Bill Ready*

Hello ${patientName},

Your pharmacy bill:
📋 Bill: ${billNo}
💵 Amount: PKR ${amount.toLocaleString()}

Please collect medicines from pharmacy counter.

_MediCare Pro Pharmacy_`.trim(),
};