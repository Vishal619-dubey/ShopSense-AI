# ShopSense AI Pro

A professional AI-powered full-stack e-commerce platform built with React, Node.js, Express and MongoDB.

## Included Features

### Customer
- JWT register/login
- Product catalog, search and category filters
- Product details, cart and wishlist
- Professional checkout form
- Indian phone and PIN-code validation
- Cash on Delivery
- Razorpay test mode
- Safe demo online-payment fallback
- Unique order ID
- Order confirmation page
- Estimated delivery date
- Order tracking timeline
- AI shopping assistant
- Natural-language product discovery
- AI review summary
- AI product comparison

### Admin
- Product creation and deletion
- Inventory visibility
- Cloudinary image upload
- Image URL fallback
- Product, user, order and revenue statistics
- Complete order management
- Status flow: Placed → Processing → Shipped → Delivered
- Cancellation status

### AI
- Groq-powered assistant when configured
- Local matching fallback without API key
- Product comparison recommendation
- Product review summary

## Setup

```powershell
npm run install-all
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
npm run seed
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/api/health`

## Demo Admin

```text
Email: admin@shopsense.ai
Password: Admin@123
```

## Optional Configuration

### Razorpay Test Mode

`server/.env`

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

Without keys, online checkout uses a safe demo payment flow.

### Cloudinary

`server/.env`

```env
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

Without Cloudinary, paste a product image URL in the admin form.

### Groq

```env
GROQ_API_KEY=xxxxx
```

Without Groq, AI product matching continues through the built-in local fallback.

## Deployment

- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas
- Images: Cloudinary
- Payments: Razorpay Test Mode