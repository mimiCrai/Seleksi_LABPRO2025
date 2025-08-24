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
var course_1 = require("./src/course/entities/course/course");
function addMissingCourses() {
    return __awaiter(this, void 0, void 0, function () {
        var courseRepo, coursesToAdd, existingCourses, existingIds_1, missingCourses, _i, missingCourses_1, courseData, finalCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, 9, 12]);
                    return [4 /*yield*/, data_source_1.default.initialize()];
                case 1:
                    _a.sent();
                    console.log('📦 Database connected successfully!');
                    courseRepo = data_source_1.default.getRepository(course_1.Course);
                    coursesToAdd = [
                        {
                            id: '550e8400-e29b-41d4-a716-446655440101',
                            title: 'Complete JavaScript Mastery',
                            description: 'Master modern JavaScript from basics to advanced concepts. Learn ES6+, DOM manipulation, async programming, and popular frameworks.',
                            instructor: 'Dr. Sarah Wilson',
                            topics: ['JavaScript', 'ES6', 'DOM', 'Async Programming', 'Frameworks'],
                            price: 1200,
                            thumbnail_image: '/static/courses/javascript-mastery.jpg',
                        },
                        {
                            id: '550e8400-e29b-41d4-a716-446655440102',
                            title: 'Python for Data Science',
                            description: 'Learn Python programming with focus on data analysis, visualization, and machine learning. Perfect for beginners and professionals.',
                            instructor: 'Prof. Michael Chen',
                            topics: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
                            price: 1500,
                            thumbnail_image: '/static/courses/python-data-science.jpg',
                        },
                        {
                            id: '550e8400-e29b-41d4-a716-446655440103',
                            title: 'React Development Bootcamp',
                            description: 'Build modern web applications with React. Learn hooks, context, routing, and state management with practical projects.',
                            instructor: 'Alex Rodriguez',
                            topics: ['React', 'Hooks', 'Context', 'Redux', 'Next.js'],
                            price: 1800,
                            thumbnail_image: '/static/courses/react-bootcamp.jpg',
                        },
                        {
                            id: '550e8400-e29b-41d4-a716-446655440104',
                            title: 'Database Design & SQL',
                            description: 'Master database fundamentals, SQL queries, database design principles, and optimization techniques for real-world applications.',
                            instructor: 'Dr. Emily Foster',
                            topics: ['SQL', 'Database Design', 'MySQL', 'PostgreSQL', 'Optimization'],
                            price: 1000,
                            thumbnail_image: '/static/courses/database-sql.jpg',
                        },
                        {
                            id: '550e8400-e29b-41d4-a716-446655440105',
                            title: 'Node.js Backend Development',
                            description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn API development, authentication, and deployment.',
                            instructor: 'James Miller',
                            topics: ['Node.js', 'Express', 'MongoDB', 'API Development', 'Authentication'],
                            price: 1400,
                            thumbnail_image: '/static/courses/nodejs-backend.jpg',
                        },
                        {
                            id: '550e8400-e29b-41d4-a716-446655440106',
                            title: 'Test Course',
                            description: 'A test course for testing functionality with multiple modules and progressive learning structure.',
                            instructor: 'Test Instructor',
                            topics: ['Testing', 'Development', 'Learning'],
                            price: 500,
                            thumbnail_image: '/static/courses/test-course.jpg',
                        },
                    ];
                    return [4 /*yield*/, courseRepo.find()];
                case 2:
                    existingCourses = _a.sent();
                    existingIds_1 = existingCourses.map(function (c) { return c.id; });
                    console.log("\n\uD83D\uDCCA Current courses in database: ".concat(existingCourses.length));
                    existingCourses.forEach(function (course) {
                        console.log("- ".concat(course.title));
                    });
                    missingCourses = coursesToAdd.filter(function (course) { return !existingIds_1.includes(course.id); });
                    if (missingCourses.length === 0) {
                        console.log('\n✅ All courses are already present!');
                        return [2 /*return*/];
                    }
                    console.log("\n\u2795 Adding ".concat(missingCourses.length, " missing courses:"));
                    _i = 0, missingCourses_1 = missingCourses;
                    _a.label = 3;
                case 3:
                    if (!(_i < missingCourses_1.length)) return [3 /*break*/, 6];
                    courseData = missingCourses_1[_i];
                    console.log("   Adding: ".concat(courseData.title));
                    return [4 /*yield*/, courseRepo.save(courseData)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("\n\uD83C\uDF89 Successfully added ".concat(missingCourses.length, " courses!"));
                    return [4 /*yield*/, courseRepo.count()];
                case 7:
                    finalCount = _a.sent();
                    console.log("\uD83D\uDCCA Total courses now: ".concat(finalCount));
                    return [3 /*break*/, 12];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 12];
                case 9:
                    if (!data_source_1.default.isInitialized) return [3 /*break*/, 11];
                    return [4 /*yield*/, data_source_1.default.destroy()];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
addMissingCourses();
