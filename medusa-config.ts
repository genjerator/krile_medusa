import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    ...(process.env.COOKIE_SECURE === "false" && {
      cookieOptions: { secure: false },
    }),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  featureFlags: {
    translation: true,
  },
  modules: [
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
      options: {
        redisUrl,
        redisOptions: {
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
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
            maxRetriesPerRequest: 3,
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
                maxRetriesPerRequest: 3,
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
                maxRetriesPerRequest: 3,
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
