import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { defineString } from 'firebase-functions/params';

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface BillData {
  billNumber: string;
  createdAt: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  patientId: string;
}

interface PatientData {
  name: string;
  email: string;
}

// Define configuration parameters
const emailUser = defineString('EMAIL_USER');
const emailPassword = defineString('EMAIL_PASSWORD');

// Initialize nodemailer transporter with email service credentials
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser.value(),
      pass: emailPassword.value()
    }
  });
}

export const sendBillEmail = onCall<{ billId: string }>({
  memory: '256MiB',
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request) => {
  // Verify auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { billId } = request.data;
  if (!billId) {
    throw new HttpsError('invalid-argument', 'Bill ID is required');
  }

  try {
    // Get bill data from Firestore
    const billDoc = await admin.firestore().collection('bills').doc(billId).get();
    if (!billDoc.exists) {
      throw new HttpsError('not-found', 'Bill not found');
    }

    const billData = billDoc.data() as BillData;
    if (!billData) {
      throw new HttpsError('internal', 'Invalid bill data');
    }

    // Get patient data to get their email
    let patientDoc;
    try {
      patientDoc = await admin.firestore().collection('patients').doc(billData.patientId).get();
      if (!patientDoc.exists) {
        console.error(`Patient with ID ${billData.patientId} not found for bill ${billId}`);
        throw new HttpsError('not-found', `Patient with ID ${billData.patientId} not found. Please verify the patient ID is correct.`);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new HttpsError('internal', 'Error fetching patient data');
    }

    const patientData = patientDoc.data() as PatientData;
    if (!patientData?.email) {
      console.error(`No email found for patient ${billData.patientId}`);
      throw new HttpsError('failed-precondition', 'Patient email not found. Please ensure patient has a valid email address.');
    }

    // Format bill details for email
    const items = billData.items.map((item: BillItem) => 
      `${item.description}: $${item.amount.toFixed(2)}`
    ).join('\n');

    const emailContent = `
      Dear ${patientData.name},

      Here is your bill summary from Healthcare EMR:

      Bill Number: ${billData.billNumber}
      Date: ${new Date(billData.createdAt).toLocaleDateString()}

      Items:
      ${items}

      Subtotal: $${billData.subtotal.toFixed(2)}
      Tax: $${billData.tax.toFixed(2)}
      Total Amount: $${billData.totalAmount.toFixed(2)}
      Amount Paid: $${billData.paidAmount?.toFixed(2) || '0.00'}
      Remaining Balance: $${(billData.totalAmount - (billData.paidAmount || 0)).toFixed(2)}

      Status: ${billData.status}

      Please contact us if you have any questions about this bill.

      Thank you for choosing Healthcare EMR.
    `;

    // Send email
    const mailer = getTransporter();
    await mailer.sendMail({
      from: emailUser.value(),
      to: patientData.email,
      subject: `Healthcare EMR Bill #${billData.billNumber}`,
      text: emailContent
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending bill email:', error);
    throw new HttpsError('internal', 'Failed to send email');
  }
});
