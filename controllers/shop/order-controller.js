// controllers/orderController.js
const paypal = require("../../helpers/paypal"); // your configured paypal instance
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

/**
 * Create Order
 * - COD: save order immediately, delete cart, return success + orderId
 * - PayPal: create PayPal payment, create a pending Order (isPaid: false) and return approvalURL + orderId
 */
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
    } = req.body;

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "paymentMethod required" });
    }

    // ----------------- COD -----------------
    if (String(paymentMethod).toLowerCase() === "cod") {
      const newOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: "confirmed",
        paymentMethod: "cod",
        paymentStatus: "pending",
        totalAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        isPaid: false,
      });

      await newOrder.save();
      // delete cart
      if (cartId) await Cart.findByIdAndDelete(cartId);

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully!",
        orderId: newOrder._id,
      });
    }

    // ----------------- PayPal -----------------
    if (String(paymentMethod).toLowerCase() === "paypal") {
      // build create_payment_json
      const create_payment_json = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          // return_url should point to a frontend route that reads query params (paymentId, PayerID)
          // and then calls backend capture endpoint with orderId stored in sessionStorage
          return_url: "http://localhost:5173/shop/paypal-return",
          cancel_url: "http://localhost:5173/shop/paypal-cancel",

          // return_url: "https://storeshop-silk.vercel.app/shop/paypal-return",
          // cancel_url: "https://storeshop-silk.vercel.app/shop/paypal-cancel",
        },
        transactions: [
          {
            item_list: {
              items: cartItems.map((item) => ({
                name: item.title,
                sku: item.productId, // we keep sku as productId
                price: Number(item.price).toFixed(2),
                currency: "USD",
                quantity: item.quantity,
              })),
            },
            amount: {
              currency: "USD",
              total: Number(totalAmount).toFixed(2),
            },
            description: "Order payment",
            invoice_number: cartId || undefined, // optional: help linking
          },
        ],
      };

      // Create a pending order BEFORE redirect so we have orderId to reference later
      // This order will be confirmed in capturePayment
      const pendingOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: "pending",
        paymentMethod: "paypal",
        paymentStatus: "pending",
        totalAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        isPaid: false,
      });

      await pendingOrder.save();

      // create paypal payment
      paypal.payment.create(create_payment_json, (error, paymentInfo) => {
        if (error) {
          console.error("PayPal create error:", error);
          // rollback pendingOrder to avoid orphan (optional)
          // await Order.findByIdAndDelete(pendingOrder._id); // can't use await in callback easily
          return res.status(500).json({
            success: false,
            message: "Error while creating PayPal payment",
          });
        }

        const approvalURL = paymentInfo.links.find(
          (l) => l.rel === "approval_url"
        )?.href;
        if (!approvalURL) {
          // remove pendingOrder to avoid stale pending
          Order.findByIdAndDelete(pendingOrder._id).catch((e) =>
            console.error(e)
          );
          return res.status(500).json({
            success: false,
            message: "Approval URL not found from PayPal",
          });
        }

        // Return approvalURL and the pending order id so frontend can store it (sessionStorage)
        return res.status(200).json({
          success: true,
          approvalURL,
          orderId: pendingOrder._id,
        });
      });

      return; // important to not fallthrough
    }

    // invalid method
    return res
      .status(400)
      .json({ success: false, message: "Invalid payment method" });
  } catch (e) {
    console.error("createOrder error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
  }
};

/**
 * Capture Payment
 * - Called after PayPal returns user to frontend; frontend must call this backend with paymentId, payerId and orderId (the pending one returned earlier)
 * - Execute PayPal payment, then update the pending Order: set isPaid true, paymentStatus paid, orderStatus confirmed,
 *   reduce product stock, delete cart, save paymentId/payerId
 */
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    if (!paymentId || !payerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "paymentId, payerId and orderId are required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Execute PayPal payment
    paypal.payment.execute(
      paymentId,
      { payer_id: payerId },
      async (error, payment) => {
        if (error) {
          console.error("PayPal execute error:", error);
          return res.status(500).json({
            success: false,
            message: "Error executing PayPal payment",
          });
        }

        // Mark order as paid and confirmed
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentId = paymentId;
        order.payerId = payerId;
        order.isPaid = true;
        order.orderUpdateDate = new Date();

        // reduce product stock
        for (const item of order.cartItems) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(404).json({
              success: false,
              message: `Product not found: ${item.productId}`,
            });
          }
          product.totalStock = Math.max(0, product.totalStock - item.quantity);
          await product.save();
        }

        // delete cart if exists
        if (order.cartId) {
          await Cart.findByIdAndDelete(order.cartId);
        }

        await order.save();

        return res.status(200).json({
          success: true,
          message: "Payment captured and order confirmed",
          data: order,
        });
      }
    );
  } catch (e) {
    console.error("capturePayment error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Some error occurred!" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
