/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const firebase_admin_1 = __importDefault(__webpack_require__(/*! firebase-admin */ "firebase-admin"));
const routes_1 = __importDefault(__webpack_require__(/*! ./routes */ "./src/routes/index.ts"));
const helloworld_1 = __importDefault(__webpack_require__(/*! ./routes/helloworld */ "./src/routes/helloworld.ts"));
const users_1 = __importDefault(__webpack_require__(/*! ./routes/users */ "./src/routes/users.ts"));
const login_1 = __importDefault(__webpack_require__(/*! ./routes/login */ "./src/routes/login.ts"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const port = 3000;
app.use('/', routes_1.default);
app.use('/helloworld', helloworld_1.default);
app.use('/users', users_1.default);
app.use('/login', login_1.default);
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.applicationDefault(),
    databaseURL: process.env.GOOGLE_APPLICATION_DATABASE
});
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
});


/***/ }),

/***/ "./src/routes/helloworld.ts":
/*!**********************************!*\
  !*** ./src/routes/helloworld.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res
        .status(200)
        .send({ message: 'HELLO WORLD!!' });
});
router.get('/test', (req, res) => {
    res
        .status(200)
        .send({ message: 'test!!' });
});
exports["default"] = router;


/***/ }),

/***/ "./src/routes/index.ts":
/*!*****************************!*\
  !*** ./src/routes/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('this is top page!');
});
exports["default"] = router;


/***/ }),

/***/ "./src/routes/login.ts":
/*!*****************************!*\
  !*** ./src/routes/login.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const router = express_1.default.Router();
exports["default"] = router;


/***/ }),

/***/ "./src/routes/users.ts":
/*!*****************************!*\
  !*** ./src/routes/users.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const firebase_admin_1 = __importDefault(__webpack_require__(/*! firebase-admin */ "firebase-admin"));
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    res.status(200).json({ users });
});
router.get('/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params?.id) },
    });
    res.status(200).json({ user });
});
router.post('/', async (req, res) => {
    const { email, password, tenant_id, display_name } = req.body;
    await firebase_admin_1.default.auth().createUser({ email, password })
        .then(async (userRecord) => {
        const uid = userRecord.uid;
        const result = await prisma.user.create({
            data: { uid, email, tenant_id, display_name },
        });
        res.status(200).json({ message: 'ok', result: result });
    })
        .catch((error) => {
        res.status(400).json({ message: 'ng', result: error });
    });
});
router.put('/:id', async (req, res) => {
    const { uid, email, tenant_id, display_name } = req.body;
    const user = await prisma.user.update({
        where: { id: parseInt(req.params?.id) },
        data: { uid, email, tenant_id, display_name },
    });
    res.status(200).json({ user });
});
router.delete('/:id', async (req, res) => {
    const user = await prisma.user.delete({
        where: { id: parseInt(req.params?.id) },
    });
    res.status(200).json({ user });
});
exports["default"] = router;


/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "firebase-admin":
/*!*********************************!*\
  !*** external "firebase-admin" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("firebase-admin");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUZBQTZCO0FBQzdCLHdFQUF1QjtBQUN2QixzR0FBMEM7QUFFMUMsK0ZBQWtDO0FBQ2xDLG1IQUFrRDtBQUNsRCxvR0FBdUM7QUFDdkMsb0dBQXdDO0FBRXhDLE1BQU0sR0FBRyxHQUFHLHFCQUFPLEdBQUU7QUFDckIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQkFBSSxHQUFFLENBQUM7QUFDZixHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFFakIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsZ0JBQVcsQ0FBQztBQUN6QixHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxvQkFBZ0IsQ0FBQztBQUN4QyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxlQUFVLENBQUM7QUFDN0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsZUFBVyxDQUFDO0FBRTlCLHdCQUFhLENBQUMsYUFBYSxDQUFDO0lBQzFCLFVBQVUsRUFBRSx3QkFBYSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRTtJQUN6RCxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkI7Q0FDckQsQ0FBQztBQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzQkYsaUZBQTZCO0FBRTdCLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsTUFBTSxFQUFFO0FBQy9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQzNCLEdBQUc7U0FDQSxNQUFNLENBQUMsR0FBRyxDQUFDO1NBQ1gsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQy9CLEdBQUc7U0FDQSxNQUFNLENBQUMsR0FBRyxDQUFDO1NBQ1gsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ2hDLENBQUMsQ0FBQztBQUVGLHFCQUFlLE1BQU07Ozs7Ozs7Ozs7Ozs7Ozs7QUNmckIsaUZBQTZCO0FBRTdCLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsTUFBTSxFQUFFO0FBQy9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7QUFDL0IsQ0FBQyxDQUFDO0FBRUYscUJBQWUsTUFBTTs7Ozs7Ozs7Ozs7Ozs7OztBQ1ByQixpRkFBNkI7QUFDN0IsTUFBTSxNQUFNLEdBQUcsaUJBQU8sQ0FBQyxNQUFNLEVBQUU7QUFrQi9CLHFCQUFlLE1BQU07Ozs7Ozs7Ozs7Ozs7Ozs7QUNuQnJCLGlGQUE2QjtBQUM3QixzR0FBMEM7QUFDMUMsNkVBQTZDO0FBRTdDLE1BQU0sTUFBTSxHQUFHLElBQUkscUJBQVksRUFBRTtBQUNqQyxNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRTtBQUcvQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7SUFDMUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNqQyxDQUFDLENBQUM7QUFHRixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3BDLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDdEMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0tBQzFDLENBQUM7SUFDRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hDLENBQUMsQ0FBQztBQUdGLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDbEMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJO0lBQzdELE1BQU0sd0JBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUM7U0FDekQsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFBRTtRQUN6QixNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRztRQUMxQixNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3RDLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRTtTQUM5QyxDQUFDO1FBQ0YsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUN6RCxDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNmLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDeEQsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBR0YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUNwQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUk7SUFDeEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFO0tBQzlDLENBQUM7SUFDRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hDLENBQUMsQ0FBQztBQUdGLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDdkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7S0FDeEMsQ0FBQztJQUNGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEMsQ0FBQyxDQUFDO0FBRUYscUJBQWUsTUFBTTs7Ozs7Ozs7Ozs7QUN2RHJCOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWlmdWt1Ly4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9haWZ1a3UvLi9zcmMvcm91dGVzL2hlbGxvd29ybGQudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1Ly4vc3JjL3JvdXRlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9haWZ1a3UvLi9zcmMvcm91dGVzL2xvZ2luLnRzIiwid2VicGFjazovL2FpZnVrdS8uL3NyYy9yb3V0ZXMvdXNlcnMudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1L2V4dGVybmFsIGNvbW1vbmpzIFwiQHByaXNtYS9jbGllbnRcIiIsIndlYnBhY2s6Ly9haWZ1a3UvZXh0ZXJuYWwgY29tbW9uanMgXCJjb3JzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1L2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzc1wiIiwid2VicGFjazovL2FpZnVrdS9leHRlcm5hbCBjb21tb25qcyBcImZpcmViYXNlLWFkbWluXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2FpZnVrdS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycydcbmltcG9ydCBGaXJlYmFzZUFkbWluIGZyb20gJ2ZpcmViYXNlLWFkbWluJ1xuXG5pbXBvcnQgaW5kZXhSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMnXG5pbXBvcnQgaGVsbG93b3JsZFJvdXRlciBmcm9tICcuL3JvdXRlcy9oZWxsb3dvcmxkJ1xuaW1wb3J0IHVzZXJSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvdXNlcnMnXG5pbXBvcnQgbG9naW5Sb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvbG9naW4nXG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKVxuYXBwLnVzZShjb3JzKCkpXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKVxuYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSlcbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoJy8nLCBpbmRleFJvdXRlcilcbmFwcC51c2UoJy9oZWxsb3dvcmxkJywgaGVsbG93b3JsZFJvdXRlcilcbmFwcC51c2UoJy91c2VycycsIHVzZXJSb3V0ZXIpXG5hcHAudXNlKCcvbG9naW4nLCBsb2dpblJvdXRlcilcblxuRmlyZWJhc2VBZG1pbi5pbml0aWFsaXplQXBwKHtcbiAgY3JlZGVudGlhbDogRmlyZWJhc2VBZG1pbi5jcmVkZW50aWFsLmFwcGxpY2F0aW9uRGVmYXVsdCgpLFxuICBkYXRhYmFzZVVSTDogcHJvY2Vzcy5lbnYuR09PR0xFX0FQUExJQ0FUSU9OX0RBVEFCQVNFXG59KVxuXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYExpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vYClcbn0pXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5yb3V0ZXIuZ2V0KCcvJywgKHJlcSwgcmVzKSA9PiB7XG4gIHJlc1xuICAgIC5zdGF0dXMoMjAwKVxuICAgIC5zZW5kKHsgbWVzc2FnZTogJ0hFTExPIFdPUkxEISEnIH0pXG59KVxuXG5yb3V0ZXIuZ2V0KCcvdGVzdCcsIChyZXEsIHJlcykgPT4ge1xuICByZXNcbiAgICAuc3RhdHVzKDIwMClcbiAgICAuc2VuZCh7IG1lc3NhZ2U6ICd0ZXN0ISEnIH0pXG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXIiLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5yb3V0ZXIuZ2V0KCcvJywgKHJlcSwgcmVzKSA9PiB7XG4gIHJlcy5zZW5kKCd0aGlzIGlzIHRvcCBwYWdlIScpXG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXIiLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vLyBQT1NUIC9sb2dpblxuLy8gcm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbi8vICAgY29uc3QgYXV0aCA9IGdldEF1dGgoKVxuLy8gICBjb25zdCBlbWFpbCA9IHJlcS5ib2R5LmVtYWlsXG4vLyAgIGNvbnN0IHBhc3N3b3JkID0gcmVxLmJvZHkucGFzc3dvcmRcblxuLy8gICBhd2FpdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChhdXRoLCBlbWFpbCwgcGFzc3dvcmQpXG4vLyAgIC50aGVuKCh1c2VyQ3JlZGVudGlhbCkgPT4ge1xuLy8gICAgIGNvbnN0IHVzZXIgPSB1c2VyQ3JlZGVudGlhbC51c2VyXG4vLyAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBtZXNzYWdlOiAnb2snLCB1c2VyOiB1c2VyIH0pXG4vLyAgIH0pXG4vLyAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbi8vICAgICByZXMuc3RhdHVzKDQwMSkuanNvbih7IG1lc3NhZ2U6ICduZycsIGVycm9yOiBlcnJvciB9KVxuLy8gICB9KVxuLy8gfSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IEZpcmViYXNlQWRtaW4gZnJvbSAnZmlyZWJhc2UtYWRtaW4nXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbi8vIEdFVCAvdXNlcnNcbnJvdXRlci5nZXQoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdXNlcnMgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kTWFueSgpXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlcnMgfSlcbn0pXG5cbi8vIEdFVCAvdXNlcnM6aWRcbnJvdXRlci5nZXQoJy86aWQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IHBhcnNlSW50KHJlcS5wYXJhbXM/LmlkKSB9LFxuICB9KVxuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHVzZXIgfSlcbn0pXG5cbi8vIFBPU1QgL3VzZXJzXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgdGVuYW50X2lkLCBkaXNwbGF5X25hbWUgfSA9IHJlcS5ib2R5XG4gIGF3YWl0IEZpcmViYXNlQWRtaW4uYXV0aCgpLmNyZWF0ZVVzZXIoeyBlbWFpbCwgcGFzc3dvcmQgfSlcbiAgLnRoZW4oYXN5bmMgKHVzZXJSZWNvcmQpID0+IHtcbiAgICBjb25zdCB1aWQgPSB1c2VyUmVjb3JkLnVpZFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByaXNtYS51c2VyLmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7IHVpZCwgZW1haWwsIHRlbmFudF9pZCwgZGlzcGxheV9uYW1lIH0sXG4gICAgfSlcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IG1lc3NhZ2U6ICdvaycsIHJlc3VsdDogcmVzdWx0IH0pXG4gIH0pXG4gIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7IG1lc3NhZ2U6ICduZycsIHJlc3VsdDogZXJyb3IgfSlcbiAgfSlcbn0pXG5cbi8vIFBVVCAvdXNlcnMvOmlkXG5yb3V0ZXIucHV0KCcvOmlkJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgdWlkLCBlbWFpbCwgdGVuYW50X2lkLCBkaXNwbGF5X25hbWUgfSA9IHJlcS5ib2R5XG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci51cGRhdGUoe1xuICAgIHdoZXJlOiB7IGlkOiBwYXJzZUludChyZXEucGFyYW1zPy5pZCkgfSxcbiAgICBkYXRhOiB7IHVpZCwgZW1haWwsIHRlbmFudF9pZCwgZGlzcGxheV9uYW1lIH0sXG4gIH0pXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuLy8gREVMRVRFIC91c2Vycy86aWRcbnJvdXRlci5kZWxldGUoJy86aWQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmRlbGV0ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IHBhcnNlSW50KHJlcS5wYXJhbXM/LmlkKSB9LFxuICB9KVxuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHVzZXIgfSlcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZpcmViYXNlLWFkbWluXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=