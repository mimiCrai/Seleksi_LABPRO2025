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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@nestjs/core");
var app_module_1 = require("../app.module");
var user_service_1 = require("../user/user.service");
function addBalance() {
    return __awaiter(this, void 0, void 0, function () {
        var app, userService, username, amount, user, newBalance, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.createApplicationContext(app_module_1.AppModule)];
                case 1:
                    app = _a.sent();
                    userService = app.get(user_service_1.UserService);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, , 10]);
                    username = process.argv[2];
                    amount = parseInt(process.argv[3]) || 1000;
                    if (!!username) return [3 /*break*/, 4];
                    console.log('Usage: npx ts-node src/scripts/add-balance.ts <username> [amount]');
                    return [4 /*yield*/, app.close()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, userService.findByIdentifier(username)];
                case 5:
                    user = _a.sent();
                    if (!!user) return [3 /*break*/, 7];
                    console.log("User '".concat(username, "' not found!"));
                    return [4 /*yield*/, app.close()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
                case 7:
                    newBalance = user.balance + amount;
                    return [4 /*yield*/, userService.updateBalance(user.id, newBalance)];
                case 8:
                    _a.sent();
                    console.log("Added $".concat(amount, " to ").concat(user.username, "'s account"));
                    console.log("New balance: $".concat(newBalance));
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error adding balance:', error_1);
                    return [3 /*break*/, 10];
                case 10: return [4 /*yield*/, app.close()];
                case 11:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
addBalance();
