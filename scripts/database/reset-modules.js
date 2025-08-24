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
var data_source_1 = require("./src/data-source");
var course_module_1 = require("./src/course/entities/course/course-module");
var user_progress_1 = require("./src/user/entities/user/user-progress");
var course_module_seeder_1 = require("./src/database/seeds/course-module.seeder");
function resetModules() {
    return __awaiter(this, void 0, void 0, function () {
        var moduleRepo, progressRepo, currentModules, orphanedModules, validModules, allProgress, newModules, modulesByCourse_1, _i, _a, _b, courseTitle, modules, orphaned, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 11, 12, 15]);
                    return [4 /*yield*/, data_source_1.default.initialize()];
                case 1:
                    _c.sent();
                    console.log('📦 Database connected successfully!');
                    moduleRepo = data_source_1.default.getRepository(course_module_1.CourseModule);
                    progressRepo = data_source_1.default.getRepository(user_progress_1.UserProgress);
                    return [4 /*yield*/, moduleRepo.find({
                            relations: ['course']
                        })];
                case 2:
                    currentModules = _c.sent();
                    console.log("\n\uD83D\uDCCA Current modules in database: ".concat(currentModules.length));
                    orphanedModules = currentModules.filter(function (module) { return !module.course; });
                    console.log("\uD83D\uDEA8 Orphaned modules (no parent course): ".concat(orphanedModules.length));
                    if (orphanedModules.length > 0) {
                        console.log('Orphaned modules:');
                        orphanedModules.forEach(function (module) {
                            console.log("- ".concat(module.title, " (ID: ").concat(module.id.substring(0, 8), "...)"));
                        });
                    }
                    validModules = currentModules.filter(function (module) { return module.course; });
                    console.log("\u2705 Valid modules (with parent course): ".concat(validModules.length));
                    if (validModules.length > 0) {
                        console.log('Valid modules:');
                        validModules.forEach(function (module) {
                            console.log("- ".concat(module.title, " \u2192 ").concat(module.course.title));
                        });
                    }
                    if (!(currentModules.length > 0)) return [3 /*break*/, 7];
                    console.log("\n\uD83D\uDDD1\uFE0F Deleting user progress records first...");
                    return [4 /*yield*/, progressRepo.find()];
                case 3:
                    allProgress = _c.sent();
                    if (!(allProgress.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, progressRepo.remove(allProgress)];
                case 4:
                    _c.sent();
                    console.log("\u2705 Deleted ".concat(allProgress.length, " progress records!"));
                    _c.label = 5;
                case 5:
                    // 3. Now delete all existing modules
                    console.log("\n\uD83D\uDDD1\uFE0F Deleting all ".concat(currentModules.length, " existing modules..."));
                    return [4 /*yield*/, moduleRepo.remove(currentModules)];
                case 6:
                    _c.sent();
                    console.log('✅ All modules deleted successfully!');
                    return [3 /*break*/, 8];
                case 7:
                    console.log('\n✅ No modules to delete.');
                    _c.label = 8;
                case 8:
                    // 4. Re-seed modules with proper course relationships
                    console.log('\n🌱 Starting module re-seeding...');
                    return [4 /*yield*/, course_module_seeder_1.SeedCourseModules.run(data_source_1.default)];
                case 9:
                    _c.sent();
                    // 5. Verify the results
                    console.log('\n🔍 Verification after seeding:');
                    return [4 /*yield*/, moduleRepo.find({
                            relations: ['course']
                        })];
                case 10:
                    newModules = _c.sent();
                    console.log("\uD83D\uDCCA Total modules seeded: ".concat(newModules.length));
                    modulesByCourse_1 = new Map();
                    newModules.forEach(function (module) {
                        var courseTitle = module.course ? module.course.title : 'No Course';
                        if (!modulesByCourse_1.has(courseTitle)) {
                            modulesByCourse_1.set(courseTitle, []);
                        }
                        modulesByCourse_1.get(courseTitle).push(module);
                    });
                    console.log('\n📈 Modules by course:');
                    for (_i = 0, _a = modulesByCourse_1.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], courseTitle = _b[0], modules = _b[1];
                        console.log("\n\uD83D\uDCDA ".concat(courseTitle, ": ").concat(modules.length, " modules"));
                        modules
                            .sort(function (a, b) { return a.order - b.order; })
                            .forEach(function (module) {
                            console.log("   ".concat(module.order, ". ").concat(module.title));
                        });
                    }
                    orphaned = newModules.filter(function (m) { return !m.course; });
                    if (orphaned.length > 0) {
                        console.log("\n\uD83D\uDEA8 WARNING: ".concat(orphaned.length, " modules still have no parent course!"));
                        orphaned.forEach(function (module) {
                            console.log("- ".concat(module.title));
                        });
                    }
                    else {
                        console.log('\n✅ SUCCESS: All modules have parent courses!');
                    }
                    return [3 /*break*/, 15];
                case 11:
                    error_1 = _c.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 15];
                case 12:
                    if (!data_source_1.default.isInitialized) return [3 /*break*/, 14];
                    return [4 /*yield*/, data_source_1.default.destroy()];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14: return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
resetModules();
