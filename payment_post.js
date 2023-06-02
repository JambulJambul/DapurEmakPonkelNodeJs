const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const midtransClient = require('midtrans-client');

// Configure body-parser middleware to parse JSON
app.use(bodyParser.json());

// Create a route to handle the payment request
app.post('/payment', async (req, res) => {
  try {
    // Retrieve payment data from the request body
    const { orderId, amount } = req.body;

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

    // Create Midtrans transaction token
    const { redirect_url } = await snap.createTransaction(paymentOptions);

    // Return the redirect URL to Flutter app
    res.json({ redirectUrl: redirect_url });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Start the server
const port = 3000; // Replace with your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});