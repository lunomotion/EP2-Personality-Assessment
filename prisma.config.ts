// import 'dotenv/config'
// import { defineConfig } from 'prisma/config'

// export default defineConfig({
  
//   schema: 'prisma/schema.prisma',
//   migrate: {
//     migrations: 'prisma/migrations',
//   },
//   studio: {
//     adapter: async () => {
//       const { PrismaPg } = await import('@prisma/adapter-pg')
//       return new PrismaPg({ connectionString: process.env.DATABASE_URL })
//     },
//   },
// })
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use placeholder if DATABASE_URL is not set (during build)
    url: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
})
