import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL

const isSandbox = process.env.PAYPAL_IS_SANDBOX !== "false"
const paypalClientId = isSandbox ? process.env.PAYPAL_CLIENT_ID_SANDBOX : process.env.PAYPAL_CLIENT_ID_LIVE
const paypalClientSecret = isSandbox ? process.env.PAYPAL_CLIENT_SECRET_SANDBOX : process.env.PAYPAL_CLIENT_SECRET_LIVE
const paypalWebhookId = isSandbox ? process.env.PAYPAL_WEBHOOK_ID_SANDBOX : process.env.PAYPAL_WEBHOOK_ID_LIVE

const paypalPlugin = paypalClientId ? [{
  resolve: "@alphabite/medusa-paypal",
  options: {
    clientId: paypalClientId,
    clientSecret: paypalClientSecret,
    isSandbox,
    webhookId: paypalWebhookId,
  },
}] : []

module.exports = defineConfig({
  plugins: paypalPlugin as any,
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
          ...(paypalClientId ? [{
            resolve: "@alphabite/medusa-paypal/providers/paypal",
            id: "paypal",
            options: {
              clientId: paypalClientId,
              clientSecret: paypalClientSecret,
              isSandbox,
              webhookId: paypalWebhookId,
            },
          }] : []),
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
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT ?? "587"),
              secure: process.env.SMTP_SECURE === "true",
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
              from: process.env.SMTP_FROM,
              bcc: process.env.SMTP_BCC,
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
