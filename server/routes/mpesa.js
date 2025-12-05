require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const admin = require('firebase-admin');

// --- FIREBASE ADMIN SETUP ---
try {
  // Ensure you have this file in your root or backend folder
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("🔥 Firebase Admin Initialized");
} catch (error) {
  console.error("❌ Error: 'serviceAccountKey.json' not found. Database updates will fail.");
}
const db = admin.firestore();

// --- ENV VARIABLES ---
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL; // MUST be a public URL (e.g., ngrok)

// --- MIDDLEWARE: GENERATE TOKEN ---
const generateToken = async (req, res, next) => {
  const secret = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${secret}` } }
    );
    req.token = response.data.access_token;
    next();
  } catch (err) {
    console.error("Token Error:", err.message);
    res.status(400).json({ error: "Authentication failed" });
  }
};

// --- ROUTE: STK PUSH ---
router.post('/stkpush', generateToken, async (req, res) => {
  const { phoneNumber, amount, eventId } = req.body; 

  if (!eventId) return res.status(400).json({ error: "Event ID is required" });

  // Format Phone (254...)
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.slice(1);
  if (!formattedPhone.startsWith("254")) formattedPhone = "254" + formattedPhone;

  // Generate Timestamp & Password
  const date = new Date();
  const timestamp = date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString("base64");

  try {
    console.log(`🚀 Sending STK Push to ${formattedPhone} for KES ${amount}`);

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.floor(amount),
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        // --- FIX 1: Use unique eventId for tracking ---
        AccountReference: eventId, 
        TransactionDesc: "Event Deposit"
      },
      { headers: { Authorization: `Bearer ${req.token}` } }
    );

    // CRITICAL: Save the CheckoutRequestID to Firestore immediately
    const checkoutRequestID = response.data.CheckoutRequestID;
    
    await db.collection('events').doc(eventId).update({
        mpesaRequestId: checkoutRequestID,
        paymentStatus: 'Processing',
        paymentStartedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ STK Sent. ReqID: ${checkoutRequestID} linked to Event: ${eventId}`);
    res.status(200).json(response.data);

  } catch (err) {
    // --- FIX 2: IMPROVED ERROR REPORTING ---
    const errorDetails = err.response ? err.response.data : { message: err.message };
    console.error("❌ STK Failed:", errorDetails);
    res.status(400).json({ error: "STK Push Failed", details: errorDetails });
  }
});

// --- ROUTE: CALLBACK (Webhooks) ---
router.post('/callback', async (req, res) => {
    try {
        console.log("--------------- 📩 CALLBACK RECEIVED ---------------");
        
        // 1. Log the incoming body to debug structure
        // console.log(JSON.stringify(req.body, null, 2)); 

        const callbackData = req.body.Body.stkCallback;
        const checkoutRequestID = callbackData.CheckoutRequestID;

        if (callbackData.ResultCode === 0) {
            // --- PAYMENT SUCCESSFUL ---
            console.log(`✅ Payment SUCCESS for ReqID: ${checkoutRequestID}`);
            
            const meta = callbackData.CallbackMetadata.Item;
            const amountPaid = meta.find(o => o.Name === 'Amount').Value;
            const mpesaReceipt = meta.find(o => o.Name === 'MpesaReceiptNumber').Value;
            const phone = meta.find(o => o.Name === 'PhoneNumber') ? meta.find(o => o.Name === 'PhoneNumber').Value : null;

            // 2. Find the event with this matching CheckoutRequestID
            const eventsRef = db.collection('events');
            const snapshot = await eventsRef.where('mpesaRequestId', '==', checkoutRequestID).get();

            if (snapshot.empty) {
                console.error(`❌ CRITICAL: No Event found in DB with mpesaRequestId: ${checkoutRequestID}`);
                return res.send("ok");
            }

            // 3. Update the document
            const batch = db.batch();
            snapshot.forEach((doc) => {
                console.log(`📝 Updating Event Document: ${doc.id}`);
                batch.update(doc.ref, {
                    status: 'Approved', 
                    paymentStatus: 'Completed',
                    amountPaid: amountPaid,
                    mpesaReceipt: mpesaReceipt,
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    payerPhone: phone
                });
            });
            await batch.commit();
            console.log("🎉 Database Updated Successfully!");

        } else {
            // --- PAYMENT CANCELLED/FAILED ---
             console.log(`⚠️ Payment Failed/Cancelled. Code: ${callbackData.ResultCode} - ${callbackData.ResultDesc}`);
             
             // Optional: Mark as failed in DB
             const eventsRef = db.collection('events');
             const snapshot = await eventsRef.where('mpesaRequestId', '==', checkoutRequestID).get();
             if (!snapshot.empty) {
                 snapshot.forEach(async (doc) => {
                     await doc.ref.update({ paymentStatus: 'Failed' });
                 });
             }
        }
    } catch (e) {
        console.error("❌ Callback Internal Error:", e);
    }
    
    // Always return 200 to Safaricom so they stop retrying
    res.send("Callback Received");
});

module.exports = router;