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
const routes_1 = __importDefault(__webpack_require__(/*! ./routes */ "./src/routes/index.ts"));
const helloworld_1 = __importDefault(__webpack_require__(/*! ./routes/helloworld */ "./src/routes/helloworld.ts"));
const users_1 = __importDefault(__webpack_require__(/*! ./routes/users */ "./src/routes/users.ts"));
const login_1 = __importDefault(__webpack_require__(/*! ./routes/login */ "./src/routes/login.ts"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/', routes_1.default);
app.use('/helloworld', helloworld_1.default);
app.use('/users', users_1.default);
app.use('/login', login_1.default);
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
        res.cookie('token', data.idToken, { httpOnly: true })
            .status(200).json({ message: 'ok', data });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7O0FDdERyQjs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haWZ1a3UvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2FpZnVrdS8uL3NyYy9yb3V0ZXMvaGVsbG93b3JsZC50cyIsIndlYnBhY2s6Ly9haWZ1a3UvLi9zcmMvcm91dGVzL2luZGV4LnRzIiwid2VicGFjazovL2FpZnVrdS8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1Ly4vc3JjL3JvdXRlcy91c2Vycy50cyIsIndlYnBhY2s6Ly9haWZ1a3UvZXh0ZXJuYWwgY29tbW9uanMgXCJAcHJpc21hL2NsaWVudFwiIiwid2VicGFjazovL2FpZnVrdS9leHRlcm5hbCBjb21tb25qcyBcImNvcnNcIiIsIndlYnBhY2s6Ly9haWZ1a3UvZXh0ZXJuYWwgY29tbW9uanMgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2FpZnVrdS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycydcblxuaW1wb3J0IGluZGV4Um91dGVyIGZyb20gJy4vcm91dGVzJ1xuaW1wb3J0IGhlbGxvd29ybGRSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvaGVsbG93b3JsZCdcbmltcG9ydCB1c2VyUm91dGVyIGZyb20gJy4vcm91dGVzL3VzZXJzJ1xuaW1wb3J0IGxvZ2luUm91dGVyIGZyb20gJy4vcm91dGVzL2xvZ2luJ1xuXG5jb25zdCBhcHAgPSBleHByZXNzKClcbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoY29ycygpKVxuYXBwLnVzZShleHByZXNzLmpzb24oKSlcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpXG5cbmFwcC51c2UoJy8nLCBpbmRleFJvdXRlcilcbmFwcC51c2UoJy9oZWxsb3dvcmxkJywgaGVsbG93b3JsZFJvdXRlcilcbmFwcC51c2UoJy91c2VycycsIHVzZXJSb3V0ZXIpXG5hcHAudXNlKCcvbG9naW4nLCBsb2dpblJvdXRlcilcblxuYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApXG59KVxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxucm91dGVyLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xuICByZXNcbiAgICAuc3RhdHVzKDIwMClcbiAgICAuc2VuZCh7IG1lc3NhZ2U6ICdIRUxMTyBXT1JMRCEhJyB9KVxufSlcblxucm91dGVyLmdldCgnL3Rlc3QnLCAocmVxLCByZXMpID0+IHtcbiAgcmVzXG4gICAgLnN0YXR1cygyMDApXG4gICAgLnNlbmQoeyBtZXNzYWdlOiAndGVzdCEhJyB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxucm91dGVyLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xuICByZXMuc2VuZCgndGhpcyBpcyB0b3AgcGFnZSEnKVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLy8gUE9TVCAvbG9naW5cbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGZpcmViYXNlQXBpS2V5ID0gJ0FJemFTeURJcmFIa3VGV1lkSXRXRXlkY2UxZGJhQXdCc1JOTk1lQSdcbiAgY29uc3QgdXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxL2FjY291bnRzOnNpZ25JbldpdGhQYXNzd29yZD9rZXk9JHtmaXJlYmFzZUFwaUtleX1gXG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSByZXEuYm9keVxuICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGVtYWlsLFxuICAgIHBhc3N3b3JkLFxuICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlXG4gIH0pXG5cbiAgYXdhaXQgZmV0Y2goXG4gICAgdXJsLFxuICAgIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5LFxuICAgIH1cbiAgKVxuICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxuICB9KVxuICAudGhlbihkYXRhID0+IHtcbiAgICByZXMuY29va2llKCd0b2tlbicsIGRhdGEuaWRUb2tlbiwgeyBodHRwT25seTogdHJ1ZSB9KVxuICAgIC5zdGF0dXMoMjAwKS5qc29uKHsgbWVzc2FnZTogJ29rJywgZGF0YSB9KVxuICB9KVxuICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgbWVzc2FnZTogJ25nJywgZXJyb3IgfSlcbiAgfSlcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLy8gR0VUIC91c2Vyc1xucm91dGVyLmdldCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VycyA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRNYW55KClcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyB1c2VycyB9KVxufSlcblxuLy8gR0VUIC91c2VyczppZFxucm91dGVyLmdldCgnLzppZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZTogeyBpZDogcGFyc2VJbnQocmVxLnBhcmFtcz8uaWQpIH0sXG4gIH0pXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuLy8gUE9TVCAvdXNlcnNcbi8vIHJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4vLyAgIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCB0ZW5hbnRfaWQsIGRpc3BsYXlfbmFtZSB9ID0gcmVxLmJvZHlcbi8vICAgYXdhaXQgRmlyZWJhc2VBZG1pbi5hdXRoKCkuY3JlYXRlVXNlcih7IGVtYWlsLCBwYXNzd29yZCB9KVxuLy8gICAudGhlbihhc3luYyAodXNlclJlY29yZCkgPT4ge1xuLy8gICAgIGNvbnN0IHVpZCA9IHVzZXJSZWNvcmQudWlkXG4vLyAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJpc21hLnVzZXIuY3JlYXRlKHtcbi8vICAgICAgIGRhdGE6IHsgdWlkLCBlbWFpbCwgdGVuYW50X2lkLCBkaXNwbGF5X25hbWUgfSxcbi8vICAgICB9KVxuLy8gICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgbWVzc2FnZTogJ29rJywgcmVzdWx0OiByZXN1bHQgfSlcbi8vICAgfSlcbi8vICAgLmNhdGNoKChlcnJvcikgPT4ge1xuLy8gICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgbWVzc2FnZTogJ25nJywgcmVzdWx0OiBlcnJvciB9KVxuLy8gICB9KVxuLy8gfSlcblxuLy8gUFVUIC91c2Vycy86aWRcbnJvdXRlci5wdXQoJy86aWQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyB1aWQsIGVtYWlsLCB0ZW5hbnRfaWQsIGRpc3BsYXlfbmFtZSB9ID0gcmVxLmJvZHlcbiAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IHBhcnNlSW50KHJlcS5wYXJhbXM/LmlkKSB9LFxuICAgIGRhdGE6IHsgdWlkLCBlbWFpbCwgdGVuYW50X2lkLCBkaXNwbGF5X25hbWUgfSxcbiAgfSlcbiAgcmVzLnN0YXR1cygyMDApLmpzb24oeyB1c2VyIH0pXG59KVxuXG4vLyBERUxFVEUgL3VzZXJzLzppZFxucm91dGVyLmRlbGV0ZSgnLzppZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZGVsZXRlKHtcbiAgICB3aGVyZTogeyBpZDogcGFyc2VJbnQocmVxLnBhcmFtcz8uaWQpIH0sXG4gIH0pXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdXNlciB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAcHJpc21hL2NsaWVudFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==