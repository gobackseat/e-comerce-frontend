const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendResponseError } = require('../middleware/middleware');

// Create payment intent for authenticated users
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, customer, shippingAddress, cartItems, orderSummary } = req.body;

    // Get user's cart to verify
    const userCartItems = await Cart.find({ userId: req.user._id }).populate('productId');
    
    if (!userCartItems || userCartItems.length === 0) {
      return sendResponseError(400, 'Cart is empty', res);
    }

    // Validate stock and recalculate totals for security
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of userCartItems) {
      const product = item.productId;
      
      if (!product) {
        return sendResponseError(400, `Product not found for cart item ${item._id}`, res);
      }

      if (product.countInStock < item.count) {
        return sendResponseError(400, `Insufficient stock for ${product.name}`, res);
      }

      const itemTotal = product.price * item.count;
      calculatedTotal += itemTotal;

      orderItems.push({
        name: product.name,
        price: product.price,
        quantity: item.count,
        product: product._id,
        image: product.image,
      });
    }

    // Apply shipping and tax
    const shipping = calculatedTotal > 100 ? 0 : 15;
    const tax = calculatedTotal * 0.08;
    const finalTotal = calculatedTotal + shipping + tax;

    // Security check: verify amount matches calculated total
    if (Math.abs(amount - Math.round(finalTotal * 100)) > 1) {
      return sendResponseError(400, 'Amount verification failed', res);
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      isGuestOrder: false,
      orderItems,
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      itemsPrice: calculatedTotal,
      taxPrice: tax,
      shippingPrice: shipping,
      totalPrice: finalTotal,
      paymentMethod: 'stripe',
      status: 'pending',
    });

    await order.save();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: currency || 'usd',
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
      description: `Order #${order._id}`,
    });

    // Update order with payment intent ID
    order.paymentResult = {
      id: paymentIntent.id,
      status: 'pending',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    await order.save();

    console.log('Payment intent created for user:', req.user._id, 'Order:', order._id);

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      orderId: order._id,
      amount: finalTotal,
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    sendResponseError(500, `Payment intent creation failed: ${error.message}`, res);
  }
};

// Create payment intent for guest users
const createGuestPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, customer, shippingAddress, cartItems, orderSummary } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return sendResponseError(400, 'Cart is empty', res);
    }

    // Validate stock and recalculate totals for security
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return sendResponseError(400, `Product not found: ${item.productId}`, res);
      }

      if (product.countInStock < item.count) {
        return sendResponseError(400, `Insufficient stock for ${product.name}`, res);
      }

      const itemTotal = product.price * item.count;
      calculatedTotal += itemTotal;

      orderItems.push({
        name: product.name,
        price: product.price,
        quantity: item.count,
        product: product._id,
        image: product.image,
      });
    }

    // Apply shipping and tax
    const shipping = calculatedTotal > 100 ? 0 : 15;
    const tax = calculatedTotal * 0.08;
    const finalTotal = calculatedTotal + shipping + tax;

    // Security check: verify amount matches calculated total
    if (Math.abs(amount - Math.round(finalTotal * 100)) > 1) {
      return sendResponseError(400, 'Amount verification failed', res);
    }

    // Create guest order
    const order = new Order({
      orderItems,
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      itemsPrice: calculatedTotal,
      taxPrice: tax,
      shippingPrice: shipping,
      totalPrice: finalTotal,
      paymentMethod: 'stripe',
      isGuestOrder: true,
      status: 'pending',
    });

    await order.save();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: currency || 'usd',
      receipt_email: customer.email,
      metadata: {
        orderId: order._id.toString(),
        isGuestOrder: 'true',
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
      description: `Guest Order #${order._id}`,
    });

    // Update order with payment intent ID
    order.paymentResult = {
      id: paymentIntent.id,
      status: 'pending',
      update_time: new Date().toISOString(),
      email_address: customer.email,
    };
    await order.save();

    console.log('Guest payment intent created for order:', order._id);

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      orderId: order._id,
      amount: finalTotal,
    });

  } catch (error) {
    console.error('Create guest payment intent error:', error);
    sendResponseError(500, `Payment intent creation failed: ${error.message}`, res);
  }
};

// Confirm payment completion
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return sendResponseError(400, 'Payment not completed', res);
    }

    // Find and update order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return sendResponseError(404, 'Order not found', res);
    }

    // Update order status
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'processing';
    order.paymentResult.status = 'completed';
    order.paymentResult.update_time = new Date().toISOString();

    // Update product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity },
        $inc: { purchaseCount: item.quantity || 1 },
      });
    }

    // Clear user's cart (only for authenticated users)
    if (order.user && !order.isGuestOrder) {
      await Cart.deleteMany({ userId: order.user });
    }

    await order.save();

    console.log('Payment confirmed for order:', order._id);

    res.json({
      success: true,
      order,
      message: 'Payment confirmed and order completed',
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    sendResponseError(500, 'Payment confirmation failed', res);
  }
};

// Single-click checkout with Stripe (authenticated users) - LEGACY
const createCheckoutSession = async (req, res) => {
  try {
    const { shippingAddress, billingAddress } = req.body;
    
    // Get user's cart
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId');
    
    if (!cartItems || cartItems.length === 0) {
      return sendResponseError(400, 'Cart is empty', res);
    }

    // Validate stock and calculate totals
    let totalAmount = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.productId;
      
      if (!product) {
        return sendResponseError(400, `Product not found for cart item ${item._id}`, res);
      }

      if (product.countInStock < item.count) {
        return sendResponseError(400, `Insufficient stock for ${product.name}`, res);
      }

      const itemTotal = product.price * item.count;
      totalAmount += itemTotal;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: product.image ? [`${process.env.CLIENT_URL}${product.image}`] : [],
          },
          unit_amount: Math.round(product.price * 100), // Stripe expects cents
        },
        quantity: item.count,
      });

      orderItems.push({
        name: product.name,
        price: product.price,
        quantity: item.count,
        product: product._id,
        image: product.image,
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      isGuestOrder: false,
      orderItems,
      shippingAddress: {
        firstName: req.user.firstName || 'Customer',
        lastName: req.user.lastName || 'Name',
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      itemsPrice: totalAmount,
      taxPrice: Math.round(totalAmount * 0.1), // 10% tax
      shippingPrice: totalAmount > 100 ? 0 : 10, // Free shipping over $100
      totalPrice: totalAmount + Math.round(totalAmount * 0.1) + (totalAmount > 100 ? 0 : 10),
      paymentMethod: 'stripe',
    });

    await order.save();

    // Use hardcoded production URLs to ensure reliability
    const successUrl = 'https://gobackseatextender.us/thank-you?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = 'https://gobackseatextender.us/';
    
    console.log('Creating authenticated checkout session with URLs:', { successUrl, cancelUrl });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      customer_email: req.user.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      billing_address_collection: 'required',
    });

    // Update order with session ID
    order.paymentResult = {
      id: session.id,
      status: 'pending',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    await order.save();

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    if (error.message) {
      sendResponseError(500, `Checkout failed: ${error.message}`, res);
    } else {
      sendResponseError(500, 'Checkout failed', res);
    }
  }
};

// Verify payment and complete order
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const order = await Order.findById(session.metadata.orderId);
      
      if (!order) {
        return sendResponseError(404, 'Order not found', res);
      }

      // Update order status
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'processing';
      order.paymentResult.status = 'completed';
      order.paymentResult.update_time = new Date().toISOString();

      // Update product stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: -item.count },
          $inc: { purchaseCount: item.count },
        });
      }

      // Clear user's cart (only for authenticated users)
      if (req.user && !order.isGuestOrder) {
        await Cart.deleteMany({ userId: req.user._id });
      }

      await order.save();

      res.json({
        success: true,
        order,
        message: 'Payment verified and order completed',
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    sendResponseError(500, 'Payment verification failed', res);
  }
};

// Verify payment intent for thank you page
const verifyPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.query;
    
    if (!paymentIntentId || !orderId) {
      return sendResponseError(400, 'Payment intent ID and order ID are required', res);
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return sendResponseError(400, 'Payment not completed', res);
    }

    // Find the order (works for both user and guest orders)
    const order = await Order.findById(orderId)
      .populate('orderItems.product', 'name images');
    
    if (!order) {
      return sendResponseError(404, 'Order not found', res);
    }

    // Verify the payment intent belongs to this order
    if (order.paymentResult.id !== paymentIntentId) {
      return sendResponseError(400, 'Payment intent does not match order', res);
    }

    res.json({
      success: true,
      order,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      },
      message: 'Payment verified successfully',
    });

  } catch (error) {
    console.error('Payment intent verification error:', error);
    sendResponseError(500, 'Payment intent verification failed', res);
  }
};

// Get checkout session status
const getCheckoutStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Get checkout status error:', error);
    sendResponseError(500, 'Failed to get checkout status', res);
  }
};

// Guest checkout with Stripe - LEGACY
const createGuestCheckoutSession = async (req, res) => {
  try {
    const { shippingAddress, cartItems, customer } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
      return sendResponseError(400, 'Cart is empty', res);
    }

    // Validate stock and calculate totals
    let totalAmount = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of cartItems) {
      // Get product from database
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return sendResponseError(400, `Product not found: ${item.productId}`, res);
      }

      if (product.countInStock < item.count) {
        return sendResponseError(400, `Insufficient stock for ${product.name}`, res);
      }

      const itemTotal = product.price * item.count;
      totalAmount += itemTotal;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: product.image ? [`${process.env.CLIENT_URL}${product.image}`] : [],
          },
          unit_amount: Math.round(product.price * 100), // Stripe expects cents
        },
        quantity: item.count,
      });

      orderItems.push({
        name: product.name,
        price: product.price,
        quantity: item.count,
        product: product._id,
        image: product.image,
      });
    }

    // Create order without user (guest order)
    const order = new Order({
      orderItems,
      shippingAddress: {
        firstName: customer?.firstName || 'Guest',
        lastName: customer?.lastName || 'Customer',
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      itemsPrice: totalAmount,
      taxPrice: Math.round(totalAmount * 0.1), // 10% tax
      shippingPrice: totalAmount > 100 ? 0 : 10, // Free shipping over $100
      totalPrice: totalAmount + Math.round(totalAmount * 0.1) + (totalAmount > 100 ? 0 : 10),
      paymentMethod: 'stripe',
      isGuestOrder: true, // Mark as guest order
    });

    await order.save();

    // Use hardcoded production URLs to ensure reliability
    const successUrl = 'https://gobackseatextender.us/thank-you?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = 'https://gobackseatextender.us/';
    
    console.log('Creating guest checkout session with URLs:', { successUrl, cancelUrl });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order._id.toString(),
        isGuestOrder: 'true',
      },
      customer_email: customer?.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      billing_address_collection: 'required',
    });

    // Update order with session ID
    order.paymentResult = {
      id: session.id,
      status: 'pending',
      update_time: new Date().toISOString(),
      email_address: customer?.email,
    };
    await order.save();

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id,
    });

  } catch (error) {
    console.error('Guest checkout error:', error);
    if (error.message) {
      sendResponseError(500, `Guest checkout failed: ${error.message}`, res);
    } else {
      sendResponseError(500, 'Guest checkout failed', res);
    }
  }
};

// Stripe webhook handler
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        const order = await Order.findById(session.metadata.orderId);
        
        if (!order) {
          console.error('Order not found for webhook:', session.metadata.orderId);
          return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'processing';
        order.paymentResult.status = 'completed';
        order.paymentResult.update_time = new Date().toISOString();

        // Update product stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { countInStock: -item.quantity },
            $inc: { purchaseCount: item.quantity },
          });
        }

        // Clear user's cart (only for authenticated users)
        if (order.user && !order.isGuestOrder) {
          await Cart.deleteMany({ userId: order.user });
        }

        await order.save();
        
        console.log('Order processed successfully via webhook:', order._id);
      } catch (error) {
        console.error('Error processing webhook order:', error);
        return res.status(500).json({ error: 'Failed to process order' });
      }
      break;
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      try {
        const order = await Order.findById(paymentIntent.metadata.orderId);
        
        if (!order) {
          console.error('Order not found for payment intent webhook:', paymentIntent.metadata.orderId);
          return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status if not already processed
        if (!order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'processing';
          order.paymentResult.status = 'completed';
          order.paymentResult.update_time = new Date().toISOString();

          // Update product stock
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { countInStock: -item.quantity },
              $inc: { purchaseCount: item.quantity || 1 },
            });
          }

          // Clear user's cart (only for authenticated users)
          if (order.user && !order.isGuestOrder) {
            await Cart.deleteMany({ userId: order.user });
          }

          await order.save();
          
          console.log('Order processed successfully via payment intent webhook:', order._id);
        }
      } catch (error) {
        console.error('Error processing payment intent webhook:', error);
        return res.status(500).json({ error: 'Failed to process payment intent' });
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  createGuestPaymentIntent,
  confirmPayment,
  verifyPaymentIntent,
  createCheckoutSession,
  createGuestCheckoutSession,
  verifyPayment,
  getCheckoutStatus,
  handleStripeWebhook,
}; 