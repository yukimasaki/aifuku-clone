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
const cookie_parser_1 = __importDefault(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'cookie-parser'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const users_1 = __importDefault(__webpack_require__(/*! ./routes/users */ "./src/routes/users.ts"));
const login_1 = __importDefault(__webpack_require__(/*! ./routes/login */ "./src/routes/login.ts"));
const verify_1 = __importDefault(__webpack_require__(/*! ./routes/verify */ "./src/routes/verify.ts"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ credentials: true, origin: 'http://nuxt-container.local:3001' }));
app.use((0, cookie_parser_1.default)());
app.use('/users', users_1.default);
app.use('/login', login_1.default);
app.use('/verify', verify_1.default);
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
});


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
router.post('/', async (req, res) => {
    const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA';
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
    const { email, password } = req.body;
    const body = JSON.stringify({
        email,
        password,
        returnSecureToken: true
    });
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    })
        .then(response => {
        return response.json();
    })
        .then(data => {
        if (data.error) {
            res.status(400).json({ message: 'ng', error: data.error });
        }
        else {
            res.cookie('token', data.idToken, { httpOnly: true, domain: 'nuxt-container.local' })
                .status(200).json({ message: 'ok', data });
        }
    })
        .catch(error => {
        res.status(401).json({ message: 'ng', error });
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

/***/ "./src/routes/verify.ts":
/*!******************************!*\
  !*** ./src/routes/verify.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const firebaseApiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA';
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`;
    const idToken = req.cookies.token;
    console.log(req.cookies);
    const body = JSON.stringify({ idToken });
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    })
        .then(response => {
        return response.json();
    })
        .then(data => {
        res.status(200).json({ message: 'ok', uid: data.users[0].localId });
    })
        .catch(error => {
        res.status(400).json({ message: 'ng', error });
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUFBTSxFQUFFLE1BQU07UUFDZCxPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7UUFDL0MsSUFBSTtLQUNMLENBQ0Y7U0FDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDZixPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUU7SUFDeEIsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ1gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3JFLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNiLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNoRCxDQUFDLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRixxQkFBZSxNQUFNOzs7Ozs7Ozs7OztBQzlCckI7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3JvdXRlcy9sb2dpbi50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvdXNlcnMudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL3ZlcmlmeS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcIkBwcmlzbWEvY2xpZW50XCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJjb3JzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuaW1wb3J0IGNvb2tpZVBhcnNlciBmcm9tICdjb29raWUtcGFyc2VyJ1xuXG5pbXBvcnQgdXNlclJvdXRlciBmcm9tICcuL3JvdXRlcy91c2VycydcbmltcG9ydCBsb2dpblJvdXRlciBmcm9tICcuL3JvdXRlcy9sb2dpbidcbmltcG9ydCB2ZXJpZnlSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvdmVyaWZ5J1xuXG5jb25zdCBhcHAgPSBleHByZXNzKClcbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoZXhwcmVzcy5qc29uKCkpXG5hcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKVxuLy8gQ09SU+ioreWumuOBguOCilxuYXBwLnVzZShjb3JzKHsgY3JlZGVudGlhbHM6IHRydWUsIG9yaWdpbjogJ2h0dHA6Ly9udXh0LWNvbnRhaW5lci5sb2NhbDozMDAxJyB9KSlcbmFwcC51c2UoY29va2llUGFyc2VyKCkpXG5cbmFwcC51c2UoJy91c2VycycsIHVzZXJSb3V0ZXIpXG5hcHAudXNlKCcvbG9naW4nLCBsb2dpblJvdXRlcilcbmFwcC51c2UoJy92ZXJpZnknLCB2ZXJpZnlSb3V0ZXIpXG5cbmFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhgTGlzdGVuaW5nIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9gKVxufSlcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbi8vIFBPU1QgL2xvZ2luXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBmaXJlYmFzZUFwaUtleSA9ICdBSXphU3lESXJhSGt1RldZZEl0V0V5ZGNlMWRiYUF3QnNSTk5NZUEnXG4gIGNvbnN0IHVybCA9IGBodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS92MS9hY2NvdW50czpzaWduSW5XaXRoUGFzc3dvcmQ/a2V5PSR7ZmlyZWJhc2VBcGlLZXl9YFxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gcmVxLmJvZHlcbiAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICBlbWFpbCxcbiAgICBwYXNzd29yZCxcbiAgICByZXR1cm5TZWN1cmVUb2tlbjogdHJ1ZVxuICB9KVxuXG4gIGF3YWl0IGZldGNoKFxuICAgIHVybCxcbiAgICB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keSxcbiAgICB9XG4gIClcbiAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgfSlcbiAgLnRoZW4oZGF0YSA9PiB7XG4gICAgaWYgKGRhdGEuZXJyb3IpIHtcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgbWVzc2FnZTogJ25nJywgZXJyb3I6IGRhdGEuZXJyb3IgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ09SU+ioreWumuOBguOCilxuICAgICAgcmVzLmNvb2tpZSgndG9rZW4nLCBkYXRhLmlkVG9rZW4sIHsgaHR0cE9ubHk6IHRydWUsIGRvbWFpbjogJ251eHQtY29udGFpbmVyLmxvY2FsJyB9KVxuICAgICAgLnN0YXR1cygyMDApLmpzb24oeyBtZXNzYWdlOiAnb2snLCBkYXRhIH0pXG4gICAgfVxuICB9KVxuICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgbWVzc2FnZTogJ25nJywgZXJyb3IgfSlcbiAgfSlcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLy8gR0VUIC91c2Vyc1xucm91dGVyLmdldCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VycyA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRNYW55KClcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyB1c2VycyB9KVxufSlcblxuLy8gR0VUIC91c2VyczppZFxucm91dGVyLmdldCgnLzppZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyBpZDogcGFyc2VJbnQocmVxLnBhcmFtcz8uaWQpIH0sXG4gIH0pXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuLy8gUE9TVCAvdXNlcnNcbi8vIHJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4vLyAgIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCB0ZW5hbnRfaWQsIGRpc3BsYXlfbmFtZSB9ID0gcmVxLmJvZHlcbi8vICAgYXdhaXQgRmlyZWJhc2VBZG1pbi5hdXRoKCkuY3JlYXRlVXNlcih7IGVtYWlsLCBwYXNzd29yZCB9KVxuLy8gICAudGhlbihhc3luYyAodXNlclJlY29yZCkgPT4ge1xuLy8gICAgIGNvbnN0IHVpZCA9IHVzZXJSZWNvcmQudWlkXG4vLyAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJpc21hLnVzZXIuY3JlYXRlKHtcbi8vICAgICAgIGRhdGE6IHsgdWlkLCBlbWFpbCwgdGVuYW50X2lkLCBkaXNwbGF5X25hbWUgfSxcbi8vICAgICB9KVxuLy8gICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgbWVzc2FnZTogJ29rJywgcmVzdWx0OiByZXN1bHQgfSlcbi8vICAgfSlcbi8vICAgLmNhdGNoKChlcnJvcikgPT4ge1xuLy8gICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgbWVzc2FnZTogJ25nJywgcmVzdWx0OiBlcnJvciB9KVxuLy8gICB9KVxuLy8gfSlcblxuLy8gUFVUIC91c2Vycy86aWRcbnJvdXRlci5wdXQoJy86aWQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyB1aWQsIGVtYWlsLCB0ZW5hbnRfaWQsIGRpc3BsYXlfbmFtZSB9ID0gcmVxLmJvZHlcbiAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IHBhcnNlSW50KHJlcS5wYXJhbXM/LmlkKSB9LFxuICAgIGRhdGE6IHsgdWlkLCBlbWFpbCwgdGVuYW50X2lkLCBkaXNwbGF5X25hbWUgfSxcbiAgfSlcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyB1c2VyIH0pXG59KVxuXG4vLyBERUxFVEUgL3VzZXJzLzppZFxucm91dGVyLmRlbGV0ZSgnLzppZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZGVsZXRlKHtcbiAgICB3aGVyZTogeyBpZDogcGFyc2VJbnQocmVxLnBhcmFtcz8uaWQpIH0sXG4gIH0pXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vLyBQT1NUIC92ZXJpZnlcbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGZpcmViYXNlQXBpS2V5ID0gJ0FJemFTeURJcmFIa3VGV1lkSXRXRXlkY2UxZGJhQXdCc1JOTk1lQSdcbiAgY29uc3QgdXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxL2FjY291bnRzOmxvb2t1cD9rZXk9JHtmaXJlYmFzZUFwaUtleX1gXG4gIGNvbnN0IGlkVG9rZW4gPSByZXEuY29va2llcy50b2tlblxuICBjb25zb2xlLmxvZyhyZXEuY29va2llcylcbiAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHsgaWRUb2tlbiB9KVxuXG4gIGF3YWl0IGZldGNoKFxuICAgIHVybCxcbiAgICB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keSxcbiAgICB9XG4gIClcbiAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgfSlcbiAgLnRoZW4oZGF0YSA9PiB7XG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBtZXNzYWdlOiAnb2snLCB1aWQ6IGRhdGEudXNlcnNbMF0ubG9jYWxJZCB9KVxuICB9KVxuICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgbWVzc2FnZTogJ25nJywgZXJyb3IgfSlcbiAgfSlcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=