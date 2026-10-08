// scripts/seed-templates.ts
// Run with: npx tsx scripts/seed-templates.ts

import { db } from "../lib/db"
import { templates } from "../lib/db/schema"
import { nanoid } from "nanoid"
const TEMPLATES = [
  {
    id: nanoid(),
    title: "Razorpay Payments",
    description: "Complete Razorpay payment integration — orders, payments, refunds, and webhooks. JWT authenticated.",
    category: "payments" as const,
    tags: ["razorpay", "payments", "india", "webhook"],
    healthScore: 92,
    endpointCount: 8,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "Razorpay Payments API", version: "1.0.0" },
      security: [{ bearerAuth: [] }],
      paths: {
        "/orders": {
          post: {
            summary: "Create a payment order",
            tags: ["Orders"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["amount", "currency"],
                    properties: {
                      amount: { type: "integer", minimum: 100, example: 49900, description: "Amount in paise" },
                      currency: { type: "string", enum: ["INR", "USD"], example: "INR" },
                      receipt: { type: "string", example: "receipt_001" },
                    },
                  },
                },
              },
            },
            responses: {
              "201": {
                description: "Order created",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Order" },
                  },
                },
              },
              "401": { description: "Unauthorized" },
              "500": { description: "Internal server error" },
            },
          },
        },
        "/orders/{orderId}": {
          get: {
            summary: "Get order by ID",
            tags: ["Orders"],
            parameters: [{ in: "path", name: "orderId", required: true, schema: { type: "string", example: "order_abc123" } }],
            responses: {
              "200": { description: "Order details", content: { "application/json": { schema: { "$ref": "#/components/schemas/Order" } } } },
              "404": { description: "Order not found" },
            },
          },
        },
        "/payments": {
          get: {
            summary: "List all payments",
            tags: ["Payments"],
            responses: {
              "200": { description: "List of payments", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Payment" } } } } },
            },
          },
        },
        "/payments/{paymentId}/capture": {
          post: {
            summary: "Capture a payment",
            tags: ["Payments"],
            parameters: [{ in: "path", name: "paymentId", required: true, schema: { type: "string", example: "pay_abc123" } }],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { type: "object", required: ["amount"], properties: { amount: { type: "integer", example: 49900 } } } } },
            },
            responses: {
              "200": { description: "Payment captured", content: { "application/json": { schema: { "$ref": "#/components/schemas/Payment" } } } },
              "400": { description: "Payment already captured" },
            },
          },
        },
        "/refunds": {
          post: {
            summary: "Create a refund",
            tags: ["Refunds"],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { type: "object", required: ["paymentId", "amount"], properties: { paymentId: { type: "string", example: "pay_abc123" }, amount: { type: "integer", example: 49900 } } } } },
            },
            responses: {
              "201": { description: "Refund created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Refund" } } } },
            },
          },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          Order: {
            type: "object",
            required: ["id", "amount", "currency", "status"],
            properties: {
              id: { type: "string", example: "order_abc123" },
              amount: { type: "integer", example: 49900 },
              currency: { type: "string", example: "INR" },
              status: { type: "string", enum: ["created", "attempted", "paid"], example: "created" },
              receipt: { type: "string", example: "receipt_001" },
              createdAt: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" },
            },
          },
          Payment: {
            type: "object",
            required: ["id", "orderId", "amount", "status"],
            properties: {
              id: { type: "string", example: "pay_abc123" },
              orderId: { type: "string", example: "order_abc123" },
              amount: { type: "integer", example: 49900 },
              status: { type: "string", enum: ["created", "authorized", "captured", "refunded", "failed"], example: "captured" },
              method: { type: "string", enum: ["card", "upi", "netbanking", "wallet"], example: "upi" },
            },
          },
          Refund: {
            type: "object",
            properties: {
              id: { type: "string", example: "rfnd_abc123" },
              paymentId: { type: "string", example: "pay_abc123" },
              amount: { type: "integer", example: 49900 },
              status: { type: "string", enum: ["pending", "processed", "failed"], example: "processed" },
            },
          },
        },
      },
    },
  },
  {
    id: nanoid(),
    title: "JWT Authentication",
    description: "Complete JWT auth flow — register, login, refresh tokens, logout, and password reset. Production ready.",
    category: "auth" as const,
    tags: ["jwt", "auth", "login", "register", "refresh-token"],
    healthScore: 96,
    endpointCount: 6,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "JWT Authentication API", version: "1.0.0" },
      paths: {
        "/auth/register": {
          post: {
            summary: "Register a new user",
            tags: ["Auth"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                      name: { type: "string", example: "Alex Rivera" },
                      email: { type: "string", format: "email", example: "alex@company.com" },
                      password: { type: "string", minLength: 8, example: "securepassword123" },
                    },
                  },
                },
              },
            },
            responses: {
              "201": { description: "User registered", content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } } },
              "409": { description: "Email already exists" },
              "400": { description: "Invalid input" },
            },
          },
        },
        "/auth/login": {
          post: {
            summary: "Login with email and password",
            tags: ["Auth"],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "alex@company.com" }, password: { type: "string", example: "securepassword123" } } } } },
            },
            responses: {
              "200": { description: "Login successful", content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } } },
              "401": { description: "Invalid credentials" },
            },
          },
        },
        "/auth/refresh": {
          post: {
            summary: "Refresh access token",
            tags: ["Auth"],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." } } } } },
            },
            responses: {
              "200": { description: "Token refreshed", content: { "application/json": { schema: { "$ref": "#/components/schemas/AuthResponse" } } } },
              "401": { description: "Invalid or expired refresh token" },
            },
          },
        },
        "/auth/logout": {
          post: {
            summary: "Logout and invalidate refresh token",
            tags: ["Auth"],
            security: [{ bearerAuth: [] }],
            responses: {
              "204": { description: "Logged out successfully" },
              "401": { description: "Unauthorized" },
            },
          },
        },
        "/auth/me": {
          get: {
            summary: "Get current user profile",
            tags: ["Auth"],
            security: [{ bearerAuth: [] }],
            responses: {
              "200": { description: "Current user", content: { "application/json": { schema: { "$ref": "#/components/schemas/User" } } } },
              "401": { description: "Unauthorized" },
            },
          },
        },
        "/auth/reset-password": {
          post: {
            summary: "Request password reset",
            tags: ["Auth"],
            requestBody: {
              required: true,
              content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email", example: "alex@company.com" } } } } },
            },
            responses: {
              "200": { description: "Reset email sent" },
              "404": { description: "Email not found" },
            },
          },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          User: {
            type: "object",
            required: ["id", "name", "email"],
            properties: {
              id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
              name: { type: "string", example: "Alex Rivera" },
              email: { type: "string", format: "email", example: "alex@company.com" },
              createdAt: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" },
            },
          },
          AuthResponse: {
            type: "object",
            required: ["accessToken", "refreshToken", "user"],
            properties: {
              accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." },
              refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." },
              expiresIn: { type: "integer", example: 3600 },
              user: { "$ref": "#/components/schemas/User" },
            },
          },
        },
      },
    },
  },
  {
    id: nanoid(),
    title: "Stripe Subscriptions",
    description: "Stripe subscription management — customers, subscriptions, plans, invoices, and webhooks.",
    category: "payments" as const,
    tags: ["stripe", "subscriptions", "billing", "saas"],
    healthScore: 94,
    endpointCount: 7,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "Stripe Subscriptions API", version: "1.0.0" },
      security: [{ bearerAuth: [] }],
      paths: {
        "/customers": {
          post: {
            summary: "Create a customer",
            tags: ["Customers"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email", example: "user@company.com" }, name: { type: "string", example: "Alex Rivera" } } } } } },
            responses: { "201": { description: "Customer created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Customer" } } } }, "400": { description: "Invalid input" } },
          },
        },
        "/subscriptions": {
          post: {
            summary: "Create a subscription",
            tags: ["Subscriptions"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["customerId", "priceId"], properties: { customerId: { type: "string", example: "cus_abc123" }, priceId: { type: "string", example: "price_abc123" } } } } } },
            responses: { "201": { description: "Subscription created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Subscription" } } } } },
          },
          get: {
            summary: "List subscriptions",
            tags: ["Subscriptions"],
            responses: { "200": { description: "List of subscriptions", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Subscription" } } } } } },
          },
        },
        "/subscriptions/{subscriptionId}/cancel": {
          post: {
            summary: "Cancel a subscription",
            tags: ["Subscriptions"],
            parameters: [{ in: "path", name: "subscriptionId", required: true, schema: { type: "string", example: "sub_abc123" } }],
            responses: { "200": { description: "Subscription cancelled", content: { "application/json": { schema: { "$ref": "#/components/schemas/Subscription" } } } }, "404": { description: "Subscription not found" } },
          },
        },
        "/invoices": {
          get: {
            summary: "List invoices",
            tags: ["Invoices"],
            responses: { "200": { description: "List of invoices", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Invoice" } } } } } },
          },
        },
        "/webhooks": {
          post: {
            summary: "Handle Stripe webhook",
            tags: ["Webhooks"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { type: { type: "string", example: "customer.subscription.updated" }, data: { type: "object" } } } } } },
            responses: { "200": { description: "Webhook processed" }, "400": { description: "Invalid webhook signature" } },
          },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          Customer: { type: "object", properties: { id: { type: "string", example: "cus_abc123" }, email: { type: "string", format: "email", example: "user@company.com" }, name: { type: "string", example: "Alex Rivera" }, createdAt: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" } } },
          Subscription: { type: "object", properties: { id: { type: "string", example: "sub_abc123" }, customerId: { type: "string", example: "cus_abc123" }, status: { type: "string", enum: ["active", "canceled", "past_due", "trialing"], example: "active" }, priceId: { type: "string", example: "price_abc123" }, currentPeriodEnd: { type: "string", format: "date-time", example: "2025-04-01T00:00:00Z" } } },
          Invoice: { type: "object", properties: { id: { type: "string", example: "in_abc123" }, customerId: { type: "string", example: "cus_abc123" }, amount: { type: "integer", example: 4900 }, status: { type: "string", enum: ["draft", "open", "paid", "void"], example: "paid" }, dueDate: { type: "string", format: "date-time", example: "2025-04-01T00:00:00Z" } } },
        },
      },
    },
  },
  {
    id: nanoid(),
    title: "AWS S3 File Upload",
    description: "S3-compatible file upload API — presigned URLs, multipart uploads, file management, and access control.",
    category: "storage" as const,
    tags: ["s3", "upload", "files", "storage", "aws"],
    healthScore: 90,
    endpointCount: 6,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "File Upload API", version: "1.0.0" },
      security: [{ bearerAuth: [] }],
      paths: {
        "/files/presigned-url": {
          post: {
            summary: "Get presigned upload URL",
            tags: ["Files"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["filename", "contentType"], properties: { filename: { type: "string", example: "profile.jpg" }, contentType: { type: "string", example: "image/jpeg" }, size: { type: "integer", example: 1048576 } } } } } },
            responses: { "200": { description: "Presigned URL", content: { "application/json": { schema: { type: "object", properties: { uploadUrl: { type: "string", format: "uri", example: "https://s3.amazonaws.com/bucket/file.jpg?signature=..." }, fileId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" }, expiresAt: { type: "string", format: "date-time", example: "2025-03-01T11:00:00Z" } } } } } }, "400": { description: "Invalid file type" } },
          },
        },
        "/files": {
          get: {
            summary: "List uploaded files",
            tags: ["Files"],
            responses: { "200": { description: "List of files", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/File" } } } } } },
          },
        },
        "/files/{fileId}": {
          get: {
            summary: "Get file details",
            tags: ["Files"],
            parameters: [{ in: "path", name: "fileId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
            responses: { "200": { description: "File details", content: { "application/json": { schema: { "$ref": "#/components/schemas/File" } } } }, "404": { description: "File not found" } },
          },
          delete: {
            summary: "Delete a file",
            tags: ["Files"],
            parameters: [{ in: "path", name: "fileId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
            responses: { "204": { description: "File deleted" }, "404": { description: "File not found" } },
          },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          File: { type: "object", required: ["id", "filename", "url", "size"], properties: { id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" }, filename: { type: "string", example: "profile.jpg" }, url: { type: "string", format: "uri", example: "https://cdn.example.com/profile.jpg" }, size: { type: "integer", example: 1048576 }, contentType: { type: "string", example: "image/jpeg" }, createdAt: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" } } },
        },
      },
    },
  },
  {
    id: nanoid(),
    title: "WhatsApp OTP via Twilio",
    description: "Send and verify OTPs via WhatsApp using Twilio. Phone verification for onboarding flows.",
    category: "messaging" as const,
    tags: ["whatsapp", "otp", "twilio", "sms", "verification"],
    healthScore: 88,
    endpointCount: 3,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "WhatsApp OTP API", version: "1.0.0" },
      paths: {
        "/otp/send": {
          post: {
            summary: "Send OTP via WhatsApp",
            tags: ["OTP"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["phone"], properties: { phone: { type: "string", example: "+919876543210" } } } } } },
            responses: { "200": { description: "OTP sent", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "OTP sent successfully" }, expiresIn: { type: "integer", example: 300 } } } } } }, "400": { description: "Invalid phone number" }, "429": { description: "Too many requests" } },
          },
        },
        "/otp/verify": {
          post: {
            summary: "Verify OTP",
            tags: ["OTP"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["phone", "otp"], properties: { phone: { type: "string", example: "+919876543210" }, otp: { type: "string", example: "123456" } } } } } },
            responses: { "200": { description: "OTP verified", content: { "application/json": { schema: { type: "object", properties: { verified: { type: "boolean", example: true }, token: { type: "string", example: "eyJhbGciOiJIUzI1NiJ9..." } } } } } }, "400": { description: "Invalid or expired OTP" } },
          },
        },
        "/otp/resend": {
          post: {
            summary: "Resend OTP",
            tags: ["OTP"],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["phone"], properties: { phone: { type: "string", example: "+919876543210" } } } } } },
            responses: { "200": { description: "OTP resent" }, "429": { description: "Too many requests — wait before resending" } },
          },
        },
      },
      components: { schemas: {} },
    },
  },
  {
    id: nanoid(),
    title: "E-commerce Orders",
    description: "Full e-commerce order management — cart, orders, line items, shipping, and order tracking.",
    category: "ecommerce" as const,
    tags: ["ecommerce", "orders", "cart", "shipping"],
    healthScore: 91,
    endpointCount: 9,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "E-commerce Orders API", version: "1.0.0" },
      security: [{ bearerAuth: [] }],
      paths: {
        "/cart": {
          get: { summary: "Get current cart", tags: ["Cart"], responses: { "200": { description: "Cart contents", content: { "application/json": { schema: { "$ref": "#/components/schemas/Cart" } } } }, "401": { description: "Unauthorized" } } },
          post: { summary: "Add item to cart", tags: ["Cart"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["productId", "quantity"], properties: { productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" }, quantity: { type: "integer", minimum: 1, example: 2 } } } } } }, responses: { "200": { description: "Item added", content: { "application/json": { schema: { "$ref": "#/components/schemas/Cart" } } } }, "400": { description: "Invalid item" } } },
        },
        "/orders": {
          get: { summary: "List user orders", tags: ["Orders"], responses: { "200": { description: "List of orders", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Order" } } } } } } },
          post: { summary: "Place an order from cart", tags: ["Orders"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["addressId", "paymentMethod"], properties: { addressId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" }, paymentMethod: { type: "string", enum: ["card", "upi", "cod"], example: "upi" } } } } } }, responses: { "201": { description: "Order placed", content: { "application/json": { schema: { "$ref": "#/components/schemas/Order" } } } }, "400": { description: "Cart is empty or invalid" } } },
        },
        "/orders/{orderId}": {
          get: { summary: "Get order details", tags: ["Orders"], parameters: [{ in: "path", name: "orderId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }], responses: { "200": { description: "Order details", content: { "application/json": { schema: { "$ref": "#/components/schemas/Order" } } } }, "404": { description: "Order not found" } } },
        },
        "/orders/{orderId}/cancel": {
          post: { summary: "Cancel an order", tags: ["Orders"], parameters: [{ in: "path", name: "orderId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }], responses: { "200": { description: "Order cancelled" }, "400": { description: "Order cannot be cancelled" } } },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          Cart: { type: "object", properties: { id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" }, items: { type: "array", items: { "$ref": "#/components/schemas/CartItem" } }, total: { type: "number", example: 149.99 } } },
          CartItem: { type: "object", properties: { productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" }, quantity: { type: "integer", example: 2 }, price: { type: "number", example: 74.99 } } },
          Order: { type: "object", required: ["id", "status", "total"], properties: { id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" }, status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], example: "confirmed" }, total: { type: "number", example: 149.99 }, items: { type: "array", items: { "$ref": "#/components/schemas/CartItem" } }, createdAt: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" } } },
        },
      },
    },
  },
  {
    id: nanoid(),
    title: "User Profile Management",
    description: "Complete user profile API — CRUD operations, avatar upload, preferences, and account settings.",
    category: "auth" as const,
    tags: ["users", "profile", "settings", "avatar"],
    healthScore: 93,
    endpointCount: 6,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "User Profile API", version: "1.0.0" },
      security: [{ bearerAuth: [] }],
      paths: {
        "/users/me": {
          get: { summary: "Get current user profile", tags: ["Profile"], responses: { "200": { description: "User profile", content: { "application/json": { schema: { "$ref": "#/components/schemas/UserProfile" } } } }, "401": { description: "Unauthorized" } } },
          patch: { summary: "Update profile", tags: ["Profile"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "Alex Rivera" }, bio: { type: "string", example: "Full-stack developer" }, website: { type: "string", format: "uri", example: "https://example.com" } } } } } }, responses: { "200": { description: "Profile updated", content: { "application/json": { schema: { "$ref": "#/components/schemas/UserProfile" } } } } } },
          delete: { summary: "Delete account", tags: ["Profile"], responses: { "204": { description: "Account deleted" }, "401": { description: "Unauthorized" } } },
        },
        "/users/me/avatar": {
          post: { summary: "Upload avatar", tags: ["Profile"], requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { avatar: { type: "string", format: "binary" } } } } } }, responses: { "200": { description: "Avatar uploaded", content: { "application/json": { schema: { type: "object", properties: { avatarUrl: { type: "string", format: "uri", example: "https://cdn.example.com/avatar.jpg" } } } } } } } },
        },
        "/users/me/preferences": {
          get: { summary: "Get user preferences", tags: ["Preferences"], responses: { "200": { description: "User preferences", content: { "application/json": { schema: { "$ref": "#/components/schemas/Preferences" } } } } } },
          put: { summary: "Update preferences", tags: ["Preferences"], requestBody: { required: true, content: { "application/json": { schema: { "$ref": "#/components/schemas/Preferences" } } } }, responses: { "200": { description: "Preferences updated" } } },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          UserProfile: { type: "object", required: ["id", "name", "email"], properties: { id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" }, name: { type: "string", example: "Alex Rivera" }, email: { type: "string", format: "email", example: "alex@company.com" }, bio: { type: "string", example: "Full-stack developer" }, avatarUrl: { type: "string", format: "uri", example: "https://cdn.example.com/avatar.jpg" }, website: { type: "string", format: "uri", example: "https://example.com" }, createdAt: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" } } },
          Preferences: { type: "object", properties: { theme: { type: "string", enum: ["light", "dark", "system"], example: "dark" }, language: { type: "string", example: "en" }, notifications: { type: "boolean", example: true }, emailUpdates: { type: "boolean", example: false } } },
        },
      },
    },
  },
  {
    id: nanoid(),
    title: "Analytics Events",
    description: "Product analytics API — track events, identify users, page views, and query aggregated metrics.",
    category: "analytics" as const,
    tags: ["analytics", "events", "tracking", "metrics"],
    healthScore: 89,
    endpointCount: 5,
    openApiSpec: {
      openapi: "3.0.0",
      info: { title: "Analytics Events API", version: "1.0.0" },
      security: [{ apiKey: [] }],
      paths: {
        "/events": {
          post: { summary: "Track an event", tags: ["Events"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["event", "userId"], properties: { event: { type: "string", example: "button_clicked" }, userId: { type: "string", example: "user_abc123" }, properties: { type: "object", example: { buttonName: "signup", page: "/landing" } }, timestamp: { type: "string", format: "date-time", example: "2025-03-01T10:30:00Z" } } } } } }, responses: { "200": { description: "Event tracked" }, "400": { description: "Invalid event data" } } },
        },
        "/events/batch": {
          post: { summary: "Track multiple events", tags: ["Events"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["events"], properties: { events: { type: "array", items: { type: "object", properties: { event: { type: "string", example: "page_viewed" }, userId: { type: "string", example: "user_abc123" } } } } } } } } }, responses: { "200": { description: "Events tracked" } } },
        },
        "/identify": {
          post: { summary: "Identify a user", tags: ["Users"], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["userId"], properties: { userId: { type: "string", example: "user_abc123" }, traits: { type: "object", example: { name: "Alex Rivera", email: "alex@company.com", plan: "pro" } } } } } } }, responses: { "200": { description: "User identified" } } },
        },
        "/metrics": {
          get: { summary: "Query aggregated metrics", tags: ["Metrics"], parameters: [{ in: "query", name: "event", schema: { type: "string", example: "button_clicked" } }, { in: "query", name: "from", schema: { type: "string", format: "date-time", example: "2025-03-01T00:00:00Z" } }, { in: "query", name: "to", schema: { type: "string", format: "date-time", example: "2025-03-31T23:59:59Z" } }], responses: { "200": { description: "Aggregated metrics", content: { "application/json": { schema: { type: "object", properties: { total: { type: "integer", example: 1234 }, uniqueUsers: { type: "integer", example: 456 }, breakdown: { type: "array", items: { type: "object", properties: { date: { type: "string", example: "2025-03-01" }, count: { type: "integer", example: 45 } } } } } } } } } } },
        },
      },
      components: {
        securitySchemes: { apiKey: { type: "apiKey", in: "header", name: "X-API-Key" } },
        schemas: {},
      },
    },
  },
]

async function seed() {
  console.log("Seeding templates...")

  for (const template of TEMPLATES) {
    await db.insert(templates).values({
      ...template,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing()
    console.log(`✔ ${template.title}`)
  }

  console.log("\nAll templates seeded successfully.")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})