"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_1 = require("./routes");
const router = (0, express_1.Router)();
// Mount keyword scraper routes
router.use('/', routes_1.keywordScraperRoutes);
exports.default = router;
