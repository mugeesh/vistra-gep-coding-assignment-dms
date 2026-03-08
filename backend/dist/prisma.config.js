"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@prisma/config");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env.example') });
exports.default = (0, config_1.defineConfig)({
    datasource: {
        url: process.env.DATABASE_URL,
    },
    migrations: {
        path: './prisma/migrations',
    },
});
//# sourceMappingURL=prisma.config.js.map