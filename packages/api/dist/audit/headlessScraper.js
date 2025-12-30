"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepAudit = deepAudit;
const puppeteer_1 = __importDefault(require("puppeteer"));
function deepAudit(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, includeMedia = false) {
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
        });
        const page = yield browser.newPage();
        if (!includeMedia) {
            yield page.setRequestInterception(true);
            page.on('request', (req) => {
                const resource = req.resourceType();
                if (['image', 'stylesheet', 'font'].includes(resource)) {
                    req.abort();
                }
                else {
                    req.continue();
                }
            });
        }
        let totalBytes = 0;
        let requestCount = 0;
        page.on('requestfinished', (req) => __awaiter(this, void 0, void 0, function* () {
            requestCount++;
            try {
                const res = yield req.response();
                const buffer = yield (res === null || res === void 0 ? void 0 : res.buffer());
                totalBytes += (buffer === null || buffer === void 0 ? void 0 : buffer.length) || 0;
            }
            catch (_a) { }
        }));
        const start = Date.now();
        yield page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const loadTime = Date.now() - start;
        const scriptCount = yield page.$$eval('script', els => els.length);
        const hasH1 = (yield page.$('h1')) !== null;
        const hasMetaDescription = (yield page.$('meta[name="description"]')) !== null;
        yield browser.close();
        return {
            loadTime,
            totalRequests: requestCount,
            totalBytes,
            scriptCount,
            hasH1,
            hasMetaDescription,
        };
    });
}
