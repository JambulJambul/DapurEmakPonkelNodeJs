const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const midtransClient = require('midtrans-client');
const functions = require("firebase-functions")
var admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })

// Configure body-parser middleware to parse JSON
app.use(bodyParser.json());

let temporaryData;

// Create a route to handle the payment request
app.post('/payment', async (req, res) => {
  try {
    // Retrieve payment data from the request body
    const { orderId, amount, uid, deliveryDate, cartItems, paymentType, orderType, numberOfDays, destinationlatitude, destinationlongtitude, destinationinformation } = req.body;

    // Initialize Midtrans client
    const snap = new midtransClient.Snap({
      isProduction: false, // Set to true for production environment
      serverKey: 'SB-Mid-server-ngRlu61P7fajFfFbn4-7Z8-4', // Replace with your Midtrans server key
      clientKey: 'SB-Mid-client-2Z-pkzYO-f4F6fWO', // Replace with your Midtrans client key
    });

    // Prepare payment options
    const paymentOptions = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      }
    };

    geoPoint = new admin.firestore.GeoPoint(destinationlatitude, destinationlongtitude);

    temporaryData = {
      orderId, amount, uid, deliveryDate, cartItems, paymentType,orderType,numberOfDays, geoPoint, destinationinformation
    };

    // Create Midtrans transaction token
    const { redirect_url } = await snap.createTransaction(paymentOptions);
    console.log('Redirect URL:', redirect_url);
    // Return the redirect URL to Flutter app
    res.status(200).json({ redirectUrl: redirect_url });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

app.get('/payment/callback', (req, res) => {
  try {
    // Handle the successful payment callback
    // Perform necessary actions (e.g., update payment status, retrieve transaction details, etc.)

    // Get the transaction details from the request query parameters
    const {
      status_code,
      status_message,
      transaction_id,
      masked_card,
      order_id,
      payment_type,
      transaction_time,
      transaction_status,
      fraud_status,
      bank,
      gross_amount
    } = req.query;

    // Log the transaction details
    console.log('Payment Callback - Transaction Details:');
    console.log('Status Code:', status_code);
    console.log('Status Message:', status_message);
    console.log('Transaction ID:', transaction_id);
    console.log('Masked Card:', masked_card);
    console.log('Order ID:', order_id);
    console.log('Payment Type:', payment_type);
    console.log('Transaction Time:', transaction_time);
    console.log('Transaction Status:', transaction_status);
    console.log('Fraud Status:', fraud_status);
    console.log('Bank:', bank);
    console.log('Gross Amount:', gross_amount);

    // Perform necessary actions (e.g., update payment status, retrieve transaction details, etc.)
    // ...

    // Redirect the user back to the Flutter app

    if (temporaryData.numberOfDays === null) {
      delete temporaryData.numberOfDays;
    }

    db.collection('payment')
      .add(temporaryData)
      .then((docRef) => {
        console.log('Payment data stored with ID:', docRef.id);
      })
      .catch((error) => {
        console.error('Error storing payment data:', error);
      });
    res.redirect('https://dapuremakponkel.page.link/orderHistory');
  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.status(500).json({ error: 'Error processing payment callback' });
  }
});

exports.api = functions.https.onRequest(app)