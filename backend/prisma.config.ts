import {defineConfig} from '@prisma/config'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({path: path.join(__dirname, '.env.example')})

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },

    // Optional: Configure migrations path
    migrations: {
        path: './prisma/migrations',
        //enable only for testing data
        //seed: 'ts-node prisma/seed.ts',
    },

})
