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
const signup_1 = __importDefault(__webpack_require__(/*! ./routes/signup */ "./src/routes/signup.ts"));
const login_1 = __importDefault(__webpack_require__(/*! ./routes/login */ "./src/routes/login.ts"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const port = 3000;
app.use('/', routes_1.default);
app.use('/helloworld', helloworld_1.default);
app.use('/users', users_1.default);
app.use('/signup', signup_1.default);
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
const auth_1 = __webpack_require__(/*! @firebase/auth */ "@firebase/auth");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const auth = (0, auth_1.getAuth)();
    const email = req.body.email;
    const password = req.body.password;
    await (0, auth_1.signInWithEmailAndPassword)(auth, email, password)
        .then((userCredential) => {
        const user = userCredential.user;
        res.status(200).json({ message: 'ok', user: user });
    })
        .catch((error) => {
        res.status(401).json({ message: 'ng', error: error });
    });
});
exports["default"] = router;


/***/ }),

/***/ "./src/routes/signup.ts":
/*!******************************!*\
  !*** ./src/routes/signup.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const firebase_admin_1 = __importDefault(__webpack_require__(/*! firebase-admin */ "firebase-admin"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.displayName,
    };
    await firebase_admin_1.default.auth().createUser(user)
        .then((userRecord) => {
        res.status(200).json({ message: 'ok', uid: userRecord.uid });
    })
        .catch((error) => {
        res.status(400).json({ message: 'ng', error: error });
    });
});
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
    const { name, email } = req.body;
    const user = await prisma.user.create({
        data: { name, email },
    });
    res.status(200).json({ user });
});
router.put('/:id', async (req, res) => {
    const { name, email } = req.body;
    const user = await prisma.user.update({
        where: { id: parseInt(req.params?.id) },
        data: { name, email },
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

/***/ "@firebase/auth":
/*!*********************************!*\
  !*** external "@firebase/auth" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@firebase/auth");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUk7SUFDaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0tBQ3RCLENBQUM7SUFDRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUMsQ0FBQztBQUdGLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDcEMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSTtJQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtRQUN2QyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0tBQ3RCLENBQUM7SUFDRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hDLENBQUMsQ0FBQztBQUdGLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDdkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7S0FDeEMsQ0FBQztJQUNGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEMsQ0FBQyxDQUFDO0FBRUYscUJBQWUsTUFBTTs7Ozs7Ozs7Ozs7QUMvQ3JCOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haWZ1a3UvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2FpZnVrdS8uL3NyYy9yb3V0ZXMvaGVsbG93b3JsZC50cyIsIndlYnBhY2s6Ly9haWZ1a3UvLi9zcmMvcm91dGVzL2luZGV4LnRzIiwid2VicGFjazovL2FpZnVrdS8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1Ly4vc3JjL3JvdXRlcy9zaWdudXAudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1Ly4vc3JjL3JvdXRlcy91c2Vycy50cyIsIndlYnBhY2s6Ly9haWZ1a3UvZXh0ZXJuYWwgY29tbW9uanMgXCJAZmlyZWJhc2UvYXV0aFwiIiwid2VicGFjazovL2FpZnVrdS9leHRlcm5hbCBjb21tb25qcyBcIkBwcmlzbWEvY2xpZW50XCIiLCJ3ZWJwYWNrOi8vYWlmdWt1L2V4dGVybmFsIGNvbW1vbmpzIFwiY29yc1wiIiwid2VicGFjazovL2FpZnVrdS9leHRlcm5hbCBjb21tb25qcyBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly9haWZ1a3UvZXh0ZXJuYWwgY29tbW9uanMgXCJmaXJlYmFzZS1hZG1pblwiIiwid2VicGFjazovL2FpZnVrdS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9haWZ1a3Uvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3Uvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnXG5pbXBvcnQgRmlyZWJhc2VBZG1pbiBmcm9tICdmaXJlYmFzZS1hZG1pbidcblxuaW1wb3J0IGluZGV4Um91dGVyIGZyb20gJy4vcm91dGVzJ1xuaW1wb3J0IGhlbGxvd29ybGRSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvaGVsbG93b3JsZCdcbmltcG9ydCB1c2VyUm91dGVyIGZyb20gJy4vcm91dGVzL3VzZXJzJ1xuaW1wb3J0IHNpZ251cFJvdXRlciBmcm9tICcuL3JvdXRlcy9zaWdudXAnXG5pbXBvcnQgbG9naW5Sb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvbG9naW4nXG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKVxuYXBwLnVzZShjb3JzKCkpXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKVxuYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSlcbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoJy8nLCBpbmRleFJvdXRlcilcbmFwcC51c2UoJy9oZWxsb3dvcmxkJywgaGVsbG93b3JsZFJvdXRlcilcbmFwcC51c2UoJy91c2VycycsIHVzZXJSb3V0ZXIpXG5hcHAudXNlKCcvc2lnbnVwJywgc2lnbnVwUm91dGVyKVxuYXBwLnVzZSgnL2xvZ2luJywgbG9naW5Sb3V0ZXIpXG5cbkZpcmViYXNlQWRtaW4uaW5pdGlhbGl6ZUFwcCh7XG4gIGNyZWRlbnRpYWw6IEZpcmViYXNlQWRtaW4uY3JlZGVudGlhbC5hcHBsaWNhdGlvbkRlZmF1bHQoKSxcbiAgZGF0YWJhc2VVUkw6IHByb2Nlc3MuZW52LkdPT0dMRV9BUFBMSUNBVElPTl9EQVRBQkFTRVxufSlcblxuYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApXG59KVxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxucm91dGVyLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xuICByZXNcbiAgICAuc3RhdHVzKDIwMClcbiAgICAuc2VuZCh7IG1lc3NhZ2U6ICdIRUxMTyBXT1JMRCEhJyB9KVxufSlcblxucm91dGVyLmdldCgnL3Rlc3QnLCAocmVxLCByZXMpID0+IHtcbiAgcmVzXG4gICAgLnN0YXR1cygyMDApXG4gICAgLnNlbmQoeyBtZXNzYWdlOiAndGVzdCEhJyB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxucm91dGVyLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xuICByZXMuc2VuZCgndGhpcyBpcyB0b3AgcGFnZSEnKVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB7IGdldEF1dGgsIHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gZnJvbSBcIkBmaXJlYmFzZS9hdXRoXCJcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vLyBQT1NUIC9sb2dpblxucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgYXV0aCA9IGdldEF1dGgoKVxuICBjb25zdCBlbWFpbCA9IHJlcS5ib2R5LmVtYWlsXG4gIGNvbnN0IHBhc3N3b3JkID0gcmVxLmJvZHkucGFzc3dvcmRcblxuICBhd2FpdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChhdXRoLCBlbWFpbCwgcGFzc3dvcmQpXG4gIC50aGVuKCh1c2VyQ3JlZGVudGlhbCkgPT4ge1xuICAgIGNvbnN0IHVzZXIgPSB1c2VyQ3JlZGVudGlhbC51c2VyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBtZXNzYWdlOiAnb2snLCB1c2VyOiB1c2VyIH0pXG4gIH0pXG4gIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICByZXMuc3RhdHVzKDQwMSkuanNvbih7IG1lc3NhZ2U6ICduZycsIGVycm9yOiBlcnJvciB9KVxuICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IEZpcmViYXNlQWRtaW4gZnJvbSAnZmlyZWJhc2UtYWRtaW4nXG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLy8gUE9TVCAvc2lnbnVwXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VyID0ge1xuICAgIGVtYWlsOiByZXEuYm9keS5lbWFpbCxcbiAgICBwYXNzd29yZDogcmVxLmJvZHkucGFzc3dvcmQsXG4gICAgZGlzcGxheU5hbWU6IHJlcS5ib2R5LmRpc3BsYXlOYW1lLFxuICB9XG4gIGF3YWl0IEZpcmViYXNlQWRtaW4uYXV0aCgpLmNyZWF0ZVVzZXIodXNlcilcbiAgLnRoZW4oKHVzZXJSZWNvcmQpID0+IHtcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IG1lc3NhZ2U6ICdvaycsIHVpZDogdXNlclJlY29yZC51aWQgfSlcbiAgfSlcbiAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgbWVzc2FnZTogJ25nJywgZXJyb3I6IGVycm9yIH0pXG4gIH0pXG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbi8vIEdFVCAvdXNlcnNcbnJvdXRlci5nZXQoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdXNlcnMgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kTWFueSgpXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlcnMgfSlcbn0pXG5cbi8vIEdFVCAvdXNlcnM6aWRcbnJvdXRlci5nZXQoJy86aWQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBwYXJzZUludChyZXEucGFyYW1zPy5pZCkgfSxcbiAgICB9KVxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuLy8gUE9TVCAvdXNlcnNcbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgY29uc3QgeyBuYW1lLCBlbWFpbCB9ID0gcmVxLmJvZHlcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuY3JlYXRlKHtcbiAgICAgIGRhdGE6IHsgbmFtZSwgZW1haWwgfSxcbiAgICB9KVxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuLy8gUFVUIC91c2Vycy86aWRcbnJvdXRlci5wdXQoJy86aWQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBuYW1lLCBlbWFpbCB9ID0gcmVxLmJvZHlcbiAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IHBhcnNlSW50KHJlcS5wYXJhbXM/LmlkKSB9LFxuICAgIGRhdGE6IHsgbmFtZSwgZW1haWwgfSxcbiAgfSlcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyB1c2VyIH0pXG59KVxuXG4vLyBERUxFVEUgL3VzZXJzLzppZFxucm91dGVyLmRlbGV0ZSgnLzppZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZGVsZXRlKHtcbiAgICB3aGVyZTogeyBpZDogcGFyc2VJbnQocmVxLnBhcmFtcz8uaWQpIH0sXG4gIH0pXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAZmlyZWJhc2UvYXV0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAcHJpc21hL2NsaWVudFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZmlyZWJhc2UtYWRtaW5cIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==