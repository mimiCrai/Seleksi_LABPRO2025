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
var user_progress_1 = require("./src/user/entities/user/user-progress");
var user_1 = require("./src/user/entities/user/user");
var course_module_1 = require("./src/course/entities/course/course-module");
var course_1 = require("./src/course/entities/course/course");
var user_course_1 = require("./src/user/entities/user/user-course");
function createTestProgress() {
    return __awaiter(this, void 0, void 0, function () {
        var userRepository, courseRepository, moduleRepository, userCourseRepository, progressRepository, users, testCourse, testModules, testUser, existingPurchase, userCourse, progressToCreate, i, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, 12, 15]);
                    return [4 /*yield*/, data_source_1.default.initialize()];
                case 1:
                    _a.sent();
                    console.log('📦 Database connected successfully!');
                    userRepository = data_source_1.default.getRepository(user_1.User);
                    courseRepository = data_source_1.default.getRepository(course_1.Course);
                    moduleRepository = data_source_1.default.getRepository(course_module_1.CourseModule);
                    userCourseRepository = data_source_1.default.getRepository(user_course_1.UserCourse);
                    progressRepository = data_source_1.default.getRepository(user_progress_1.UserProgress);
                    // Clear existing progress
                    return [4 /*yield*/, progressRepository.clear()];
                case 2:
                    // Clear existing progress
                    _a.sent();
                    console.log('🗑️  Cleared existing user progress');
                    return [4 /*yield*/, userRepository.find()];
                case 3:
                    users = _a.sent();
                    return [4 /*yield*/, courseRepository.findOne({
                            where: { title: 'Test Course' }
                        })];
                case 4:
                    testCourse = _a.sent();
                    if (!testCourse) {
                        console.log('❌ Test Course not found');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, moduleRepository.find({
                            where: { course: { id: testCourse.id } },
                            relations: ['course'],
                            order: { order: 'ASC' }
                        })];
                case 5:
                    testModules = _a.sent();
                    console.log("Found ".concat(users.length, " users and ").concat(testModules.length, " modules in Test Course"));
                    testUser = users.find(function (u) { return !u.is_admin; });
                    if (!(testUser && testModules.length > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, userCourseRepository.findOne({
                            where: {
                                user: { id: testUser.id },
                                course: { id: testCourse.id }
                            }
                        })];
                case 6:
                    existingPurchase = _a.sent();
                    if (!!existingPurchase) return [3 /*break*/, 8];
                    userCourse = userCourseRepository.create({
                        user: testUser,
                        course: testCourse,
                        purchased_at: new Date()
                    });
                    return [4 /*yield*/, userCourseRepository.save(userCourse)];
                case 7:
                    _a.sent();
                    console.log("\u2705 Created course purchase for ".concat(testUser.username));
                    _a.label = 8;
                case 8:
                    progressToCreate = [];
                    for (i = 0; i < Math.min(2, testModules.length); i++) {
                        progressToCreate.push({
                            user: testUser,
                            module: testModules[i],
                            completed_at: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000) // Days ago
                        });
                    }
                    return [4 /*yield*/, progressRepository.save(progressToCreate)];
                case 9:
                    _a.sent();
                    console.log("\u2705 Created ".concat(progressToCreate.length, " progress records for ").concat(testUser.username));
                    _a.label = 10;
                case 10:
                    console.log('🎉 Test progress setup completed!');
                    console.log("\uD83D\uDC64 Test with user: ".concat(testUser === null || testUser === void 0 ? void 0 : testUser.username));
                    return [3 /*break*/, 15];
                case 11:
                    error_1 = _a.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 15];
                case 12:
                    if (!data_source_1.default.isInitialized) return [3 /*break*/, 14];
                    return [4 /*yield*/, data_source_1.default.destroy()];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
createTestProgress();
