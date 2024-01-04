"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = __importDefault(require("./manifest"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fetcher_1 = require("./fetcher");
const app = (0, express_1.default)();
const PORT = 3030;
app.use((0, cors_1.default)());
app.get("/manifest.json", function (req, res, next) {
    return res.json(manifest_1.default);
});
app.get("/:username/manifest.json", async function (req, res, next) {
    try {
        await (0, fetcher_1.watchlist_fetcher)(req.params.username);
        return res.json({ ok: true });
    }
    catch (e) {
        return res.json({ error: e });
    }
});
app.listen(PORT, () => console.log(`Addon URL: http://localhost:${PORT}/manifest.json`));
//# sourceMappingURL=index.js.map