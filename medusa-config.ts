import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL

// @easypayment/medusa-payment-paypal manages credentials and the
// sandbox/live toggle through Medusa Admin → Settings → PayPal, so no
// client id/secret is passed here. PAYPAL_ENCRYPTION_KEY (optional) enables
// AES-256-GCM encryption of the stored secret/access token.
module.exports = defineConfig({
  plugins: [
    {
      resolve: "@easypayment/medusa-payment-paypal",
      options: {},
    },
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    ...(process.env.COOKIE_SECURE === "false" && {
      cookieOptions: { secure: false, sameSite: "lax" },
    }),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    // Raise the admin media upload limit from the 1MB default to 5MB
    maxUploadFileSize: 5 * 1024 * 1024,
  },
  featureFlags: {
    translation: true,
  },
  modules: [
    {
      resolve: "./src/modules/newsletter",
    },
    {
      resolve: "./src/modules/productInquiry",
    },
    {
      resolve: "./src/modules/reparatur",
    },
    {
      resolve: "./src/modules/weeklyAction",
    },
    {
      resolve: "./src/modules/brevoWebhookLog",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-manual",
            id: "manual",
            options: {},
          },
          ...(process.env.STRIPE_API_KEY ? [{
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          }] : []),
          {
            resolve: "@easypayment/medusa-payment-paypal/providers/paypal",
            id: "paypal",
            options: {},
            dependencies: ["paypal_onboarding"],
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
            options: {},
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/smtp-notification",
            id: "smtp",
            options: {
              channels: ["email"],
              // One account per storefront brand. Account 0 is the default
              // (used when no `account` is passed / unknown sales channel).
              accounts: [
                {
                  key: "industries",
                  host: process.env.SMTP_INDUSTRIES_HOST,
                  port: parseInt(process.env.SMTP_INDUSTRIES_PORT ?? "587"),
                  secure: process.env.SMTP_INDUSTRIES_SECURE === "true",
                  user: process.env.SMTP_INDUSTRIES_USER,
                  pass: process.env.SMTP_INDUSTRIES_PASS,
                  from: process.env.SMTP_INDUSTRIES_FROM,
                  // BCC disabled (not needed). Re-enable to send a hidden copy.
                  // bcc: process.env.SMTP_INDUSTRIES_BCC,
                },
                // Planeta GmbH / planeta-shop.de — only registered when its
                // mailbox credentials are configured. Until then, code falls
                // back to the "industries" account.
                ...(process.env.SMTP_SHOP_USER
                  ? [
                      {
                        key: "planeta",
                        host:
                          process.env.SMTP_SHOP_HOST ||
                          process.env.SMTP_INDUSTRIES_HOST,
                        port: parseInt(
                          process.env.SMTP_SHOP_PORT ??
                            process.env.SMTP_INDUSTRIES_PORT ??
                            "587"
                        ),
                        secure:
                          (process.env.SMTP_SHOP_SECURE ??
                            process.env.SMTP_INDUSTRIES_SECURE) === "true",
                        user: process.env.SMTP_SHOP_USER,
                        pass: process.env.SMTP_SHOP_PASS,
                        from: process.env.SMTP_SHOP_FROM,
                        // BCC disabled (not needed). Re-enable to send a hidden copy.
                        // bcc:
                        //   process.env.SMTP_SHOP_BCC ||
                        //   process.env.SMTP_INDUSTRIES_BCC,
                      },
                    ]
                  : []),
              ],
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/translation",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              prefix: "planeta_admin/",
            },
          },
        ],
      },
    },
    ...(redisUrl ? [
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      key: Modules.EVENT_BUS,
      options: {
        redisUrl,
        redisOptions: {
          connectTimeout: 10000,
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          retryStrategy: (times: number) => Math.min(times * 1000, 10000),
        },
        jobOptions: {
          removeOnComplete: { age: 3600, count: 1000 },
          removeOnFail: { age: 3600, count: 1000 },
        },
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl,
          redisOptions: {
            connectTimeout: 10000,
            maxRetriesPerRequest: null,
            enableOfflineQueue: false,
            retryStrategy: (times: number) => Math.min(times * 1000, 10000),
          },
        },
      },
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl,
              redisOptions: {
                connectTimeout: 10000,
                maxRetriesPerRequest: null,
                enableOfflineQueue: false,
                retryStrategy: (times: number) => Math.min(times * 1000, 10000),
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl,
              redisOptions: {
                connectTimeout: 10000,
                maxRetriesPerRequest: null,
                enableOfflineQueue: false,
                retryStrategy: (times: number) => Math.min(times * 1000, 10000),
              },
            },
          },
        ],
      },
    },
    ] : []),
  ],
})
