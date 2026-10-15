import mongoose from "mongoose"

// Task 1 — Order model.
// The order stores a SNAPSHOT of purchase-time product data (name, price, image)
// so it stays accurate even if the Product document changes or is deleted later.
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        // Snapshot fields — must NOT be just { productId, quantity }
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: {
            type: String
        }
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        shippingAddress: {
            fullName: String,
            phone: String,
            addressLine1: String,
            city: String,
            state: String,
            pincode: String
        },

        // Calculated on the server from latest Product prices — never trusted from the frontend
        totalAmount: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING"
        },

        status: {
            type: String,
            enum: [
                "PENDING_PAYMENT",
                "PLACED",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED"
            ],
            default: "PENDING_PAYMENT"
        },

        razorpayOrderId: String,
        razorpayPaymentId: String
    },
    { timestamps: true } // createdAt timestamp comes automatically
)

const Order = mongoose.model("Order", orderSchema)

export default Order
