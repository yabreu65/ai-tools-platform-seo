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
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAudit = basicAudit;
const torScraper_1 = require("../services/torScraper");
function basicAudit(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { $ } = yield (0, torScraper_1.getPageWithTor)(url);
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const canonical = $('link[rel="canonical"]').attr('href') || '';
        const headings = [];
        let h1 = '';
        $('h1, h2, h3').each((_, el) => {
            var _a, _b;
            const tag = (_b = (_a = $(el)[0]) === null || _a === void 0 ? void 0 : _a.tagName) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            const texto = $(el).text().trim();
            headings.push(texto);
            if (tag === 'h1' && !h1)
                h1 = texto;
        });
        const links = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('javascript'))
                links.push(href);
        });
        const imagesWithoutAlt = $('img').filter((_, el) => !$(el).attr('alt')).length;
        return {
            title,
            description,
            headings,
            h1,
            links,
            imagesWithoutAlt,
            canonical,
        };
    });
}
