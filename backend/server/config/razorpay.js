import Razorpay from "razorpay"
import crypto from "crypto"

// Section 27 Step 5 — Razorpay configuration.
//
// REAL MODE: set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (Test Mode keys, format
// rzp_test_xxxxx) in backend/server/.env. The Key Secret lives ONLY here on the
// backend — it never reaches React and is never stored in MongoDB.
//
// DEMO MODE: if no Razorpay keys are configured, the app falls back to a local
// simulated payment flow (same create/verify/signature path, zero network
// calls) so the lab can run end-to-end without a Razorpay account.
export const isRazorpayConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
)

export const razorpay = isRazorpayConfigured
    ? new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
      })
    : null

// Secret used ONLY in demo mode to sign simulated payments with the exact same
// HMAC-SHA256 scheme the real verification endpoint uses.
const DEMO_SECRET = "shopkart-demo-test-mode-secret"

export const getPaymentSecret = () =>
    isRazorpayConfigured ? process.env.RAZORPAY_KEY_SECRET : DEMO_SECRET

export const getPublicKeyId = () =>
    isRazorpayConfigured ? process.env.RAZORPAY_KEY_ID : "rzp_test_demo_mode"

// Creates a Razorpay Order. In demo mode a locally generated order id with the
// same "order_" prefix shape is produced instead of calling the Razorpay API.
export const createPaymentOrder = async ({ amountInPaise, receipt }) => {
    if (isRazorpayConfigured) {
        return razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt
        })
    }

    return {
        id: `order_demo_${crypto.randomBytes(10).toString("hex")}`,
        amount: amountInPaise,
        currency: "INR",
        receipt,
        status: "created"
    }
}

// Standard Razorpay signature: HMAC-SHA256(razorpayOrderId|razorpayPaymentId, keySecret)
export const generateSignature = (razorpayOrderId, razorpayPaymentId) =>
    crypto
        .createHmac("sha256", getPaymentSecret())
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex")

export default razorpay
