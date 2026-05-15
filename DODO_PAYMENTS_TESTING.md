# Dodo Payments Migration Testing Guide

This guide will help you test the new Dodo Payments integration after switching from Lemon Squeezy.

## Prerequisites

1. **Create Dodo Payments Account**
   - Sign up at [app.dodopayments.com](https://app.dodopayments.com)
   - Complete account verification (much easier for Indian users!)

2. **Configure Dodo Payments Products**
   - Create "Starter" and "Pro" products in your dashboard
   - Note the Product IDs for environment configuration

3. **Get API Credentials**
   - Go to Developer > API in dashboard
   - Copy your API key
   - Go to Developer > Webhooks
   - Create webhook endpoint: `https://yourapp.com/api/webhooks/dodo`
   - Copy webhook secret key

4. **Update Environment Variables**
   ```bash
   # Replace these in your .env.local:
   DODO_PAYMENTS_API_KEY=your_api_key_here
   DODO_WEBHOOK_SECRET=your_webhook_secret_here
   DODO_STARTER_PRODUCT_ID=prod_starter_123
   DODO_PRO_PRODUCT_ID=prod_pro_456
   ```

## Testing Checklist

### 1. Database Schema Migration ✅
- [ ] Database fields updated: `lsCustomerId` → `dodoCustomerId`
- [ ] Database fields updated: `lsSubscriptionId` → `dodoSubscriptionId`  
- [ ] New field added: `dodoPaymentId`

### 2. API Endpoints Testing

#### Checkout Flow Test
1. **Start development server:**
   ```bash
   cd app && npm run dev
   ```

2. **Test checkout endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"plan": "starter"}'
   ```

3. **Expected responses:**
   - Success: Returns `{ checkoutUrl: "https://checkout.dodopayments.com/..." }`
   - Error: Returns error with status 400/500

4. **Manual test:**
   - Navigate to your app dashboard
   - Click upgrade to "Starter" plan
   - Should redirect to Dodo Payments checkout

#### Webhook Handler Test
1. **Test webhook endpoint signature verification:**
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/dodo \
     -H "webhook-id: test-id" \
     -H "webhook-signature: test-signature" \
     -H "webhook-timestamp: $(date +%s)" \
     -d '{"event": "payment.succeeded", "data": {"id": "test"}}'
   ```

2. **Expected response:** 401 (invalid signature) or 200 (success)

#### Verify Payment Test
1. **Test verification endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/verify-payment
   ```

2. **Expected responses:**
   - No Dodo customer: `{ updated: false, plan: "free", message: "No customer found" }`
   - Active subscription: `{ updated: true, plan: "starter" | "pro", status: "active" }`

### 3. Development Environment Testing

#### Local Testing with Test Mode
Dodo Payments provides test mode for development:
- Set `DODO_ENVIRONMENT=test_mode` in your environment
- Use test product IDs from dashboard
- Test payments won't charge real cards

#### Fallback URL Testing
If API calls fail, the system falls back to direct payment links:
- Test checkout with invalid API key
- Should return direct checkout URL with user metadata

### 4. Production Deployment Testing

#### 1. Update Environment Variables
```bash
# Production .env should use live mode
DODO_PAYMENTS_API_KEY=your_live_api_key
DODO_WEBHOOK_SECRET=your_live_webhook_secret
DODO_STARTER_PRODUCT_ID=your_live_starter_product_id
DODO_PRO_PRODUCT_ID=your_live_pro_product_id
```

#### 2. Configure Production Webhook
- Update webhook URL in Dodo dashboard to: `https://yourapp.com/api/webhooks/dodo`
- Test webhook delivery with sample events

#### 3. Test Payment Flow
- Use test card numbers from Dodo Payments docs
- Complete test transactions
- Verify webhook events are received
- Check database updates correctly

### 5. Webhook Event Testing

#### Sample Events to Test

**Payment Succeeded:**
```json
{
  "event": "payment.succeeded",
  "data": {
    "id": "pay_123",
    "attributes": {
      "status": "succeeded",
      "customer": {
        "id": "cus_123",
        "email": "user@example.com"
      }
    }
  }
}
```

**Subscription Active:**
```json
{
  "event": "subscription.active",
  "data": {
    "id": "sub_123",
    "attributes": {
      "status": "active",
      "customer": {
        "id": "cus_123",
        "email": "user@example.com"
      },
      "subscription": {
        "id": "sub_123",
        "status": "active",
        "product_name": "Starter Plan",
        "variant_name": "Monthly",
        "price": 900
      }
    }
  }
}
```

**Subscription Cancelled:**
```json
{
  "event": "subscription.cancelled",
  "data": {
    "id": "sub_123",
    "attributes": {
      "status": "cancelled"
    }
  }
}
```

### 6. Error Handling Tests

#### Test Scenarios:
1. **Invalid API key** - Should show fallback URL
2. **Invalid product ID** - Should show fallback URL  
3. **Invalid webhook signature** - Should return 401
4. **Malformed webhook data** - Should return 400
5. **Database connection error** - Should return 500

### 7. Migration Validation

#### Data Migration Check:
1. **Check existing user data:**
   ```sql
   SELECT id, email, plan, dodoCustomerId, dodoSubscriptionId, subscriptionStatus
   FROM users 
   WHERE plan IN ('starter', 'pro');
   ```

2. **Verify plan mapping:**
   - Starter plan → `plan: "starter"`
   - Pro plan → `plan: "pro"`

#### Functional Validation:
1. **Existing users** should maintain their subscriptions
2. **New users** should be able to subscribe to new plans
3. **Cancelled subscriptions** should downgrade to "free"

### 8. Performance Testing

#### Test Load:
- Simulate multiple concurrent checkout requests
- Test webhook processing under load
- Verify database performance during payment updates

### Troubleshooting

#### Common Issues:

1. **Webhook Verification Fails:**
   - Check webhook secret key matches
   - Ensure headers are properly passed
   - Verify timestamp format

2. **Checkout Returns Error:**
   - Check API key is valid
   - Verify product IDs exist in dashboard
   - Confirm environment is correct (test/live)

3. **Database Not Updated:**
   - Check database connection
   - Verify user exists in database
   - Check field names in schema

4. **Payment Not Processed:**
   - Check test card numbers are valid
   - Verify payment amount matches product price
   - Check customer information is complete

## Next Steps

1. **Enable Live Mode:** Once testing complete, switch to live mode in production
2. **Monitor Webhooks:** Set up monitoring for webhook delivery
3. **Update Documentation:** Update any user-facing docs about payment process
4. **Customer Communication:** Inform users about the new payment provider

## Support

- Dodo Payments Docs: https://docs.dodopayments.com
- Dodo Discord: https://discord.gg/bYqAp4ayYh
- Email Support: support@dodopayments.com

The migration should be much easier with Dodo Payments, especially for Indian users! Their verification process is significantly simpler and more accessible.