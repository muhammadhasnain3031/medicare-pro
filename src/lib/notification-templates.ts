// src/lib/notification-templates.ts

export const NotificationTemplates = {
  appointmentConfirmed: (patientName: string, doctorName: string, date: string, time: string) => `
🏥 *MediCare Pro*
✅ *Appointment Confirmed*

Hello ${patientName},
Your appointment with Dr. ${doctorName} is confirmed.
📅 Date: ${date}
⏰ Time: ${time}
Thank you for choosing MediCare Pro.`.trim(),

  appointmentReminder: (patientName: string, doctorName: string, date: string, time: string) => `
🏥 *MediCare Pro*
⏰ *Reminder: Appointment*

Hello ${patientName},
Friendly reminder for your appointment with Dr. ${doctorName}.
📅 Date: ${date}
⏰ Time: ${time}
Please arrive 10 minutes early.`.trim(),

  appointmentCancelled: (patientName: string, date: string) => `
🏥 *MediCare Pro*
❌ *Appointment Cancelled*

Hello ${patientName},
Your appointment scheduled for ${date} has been cancelled. 
Please contact us to reschedule.`.trim(),

  labReportReady: (patientName: string) => `
🏥 *MediCare Pro*
🔬 *Lab Report Ready*

Hello ${patientName},
Your laboratory test results are now ready. You can collect them from the reception or view them in your portal.`.trim(),

  billGenerated: (patientName: string, amount: string) => `
🏥 *MediCare Pro*
🧾 *Invoice Generated*

Hello ${patientName},
A new bill has been generated for your recent visit.
💰 Total Amount: Rs. ${amount}
Please clear the dues at the billing counter.`.trim(),

  paymentReceived: (patientName: string, amount: string) => `
🏥 *MediCare Pro*
💳 *Payment Confirmed*

Hello ${patientName},
We have successfully received your payment of Rs. ${amount}.
Thank you for the transaction.`.trim(),

  prescriptionReady: (patientName: string) => `
🏥 *MediCare Pro*
💊 *Prescription Ready*

Hello ${patientName},
Your prescription has been uploaded by the doctor. You can now collect your medicines from the pharmacy.`.trim(),

  dueBillReminder: (patientName: string, amount: string) => `
🏥 *MediCare Pro*
⚠️ *Payment Due*

Hello ${patientName},
This is a reminder regarding your pending balance of Rs. ${amount}.
Please settle the payment at your earliest convenience.`.trim(),

  welcomePatient: (patientName: string) => `
🏥 *MediCare Pro*
👋 *Welcome!*

Hello ${patientName},
Welcome to MediCare Pro! We are committed to providing you with the best healthcare services.`.trim(),

  customMessage: (message: string) => message.trim(),
};