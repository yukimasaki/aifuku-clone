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
const users_1 = __importDefault(__webpack_require__(/*! ./routes/users */ "./src/routes/users.ts"));
const login_1 = __importDefault(__webpack_require__(/*! ./routes/login */ "./src/routes/login.ts"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const port = 3000;
app.use('/api/users', users_1.default);
app.use('/api/login', login_1.default);
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
});


/***/ }),

/***/ "./src/middleware/verify.ts":
/*!**********************************!*\
  !*** ./src/middleware/verify.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.verify = void 0;
const firebase_1 = __webpack_require__(/*! src/utils/firebase */ "./src/utils/firebase.ts");
const verify = async (req, res, next) => {
    const { checkIdToken } = (0, firebase_1.useFirebase)();
    const user = await checkIdToken(req);
    if (!user.error) {
        return next();
    }
    res.send({
        statusCode: user.error.code,
        statusMessage: 'Unauthorized',
        message: user.error.message,
    });
};
exports.verify = verify;


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
const validator_1 = __importDefault(__webpack_require__(/*! validator */ "validator"));
const firebase_1 = __webpack_require__(/*! src/utils/firebase */ "./src/utils/firebase.ts");
const verify_1 = __webpack_require__(/*! ../middleware/verify */ "./src/middleware/verify.ts");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const valid = (email, password) => {
        const ruleEmail = () => validator_1.default.isEmail(email);
        const rulePassword = () => validator_1.default.isStrongPassword(password, { minLength: 6 });
        const validationResult = [
            ruleEmail(),
            rulePassword(),
        ].every(result => result === true);
        return validationResult;
    };
    const login = async (email, password) => {
        console.log(`login`);
        const { signInWithEmailAndPassword } = (0, firebase_1.useFirebase)();
        const user = await signInWithEmailAndPassword(email, password);
        return user;
    };
    const onFailureLogin = (error) => {
        console.log(`onFailureLogin`);
        const { errMsgToStatusCodeAndMessage } = (0, firebase_1.useFirebase)();
        const message = error.message;
        const { statusCode, statusMessage } = errMsgToStatusCodeAndMessage(message);
        return { statusCode, statusMessage, message };
    };
    const body = req.body;
    const { email, password } = body;
    if (!email || !password) {
        res
            .status(400)
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid request body',
        });
    }
    const validationResult = valid(email, password);
    if (!validationResult) {
        res
            .status(400)
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Validation failed',
        });
    }
    const user = await login(email, password);
    if (user.error) {
        const { statusCode, statusMessage, message } = onFailureLogin(user.error);
        res
            .send({
            statusCode,
            statusMessage,
            message,
        });
    }
    const time = 60 * 60 * 1000;
    const expires = new Date(Date.now() + time);
    res.cookie('token', user.idToken, {
        expires: expires,
    });
    res
        .send({
        uid: user.localId,
        email: user.email,
    });
});
router.delete('/', verify_1.verify, async (req, res) => {
    try {
        res
            .clearCookie('token')
            .send({});
    }
    catch (error) {
        res.send({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Unexpected error',
        });
    }
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
const validator_1 = __importDefault(__webpack_require__(/*! validator */ "validator"));
const firebase_1 = __webpack_require__(/*! src/utils/firebase */ "./src/utils/firebase.ts");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
const verify_1 = __webpack_require__(/*! ../middleware/verify */ "./src/middleware/verify.ts");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', verify_1.verify, async (req, res) => {
    const valid = (email, password, displayName, tenantId) => {
        const ruleEmail = () => validator_1.default.isEmail(email);
        const rulePassword = () => validator_1.default.isStrongPassword(password, { minLength: 6 });
        const ruleDisplayName = () => {
            const isSomeText = [
                validator_1.default.isAscii(displayName),
                validator_1.default.isMultibyte(displayName),
            ].some(result => result === true);
            const isValid = [
                isSomeText,
                validator_1.default.isLength(displayName, { min: 1, max: 32 }),
            ].every(result => result === true);
            return isValid;
        };
        const ruleTenantId = () => validator_1.default.isInt(tenantId);
        const validationResult = [
            ruleEmail(),
            rulePassword(),
            ruleDisplayName(),
            ruleTenantId(),
        ].every(result => result === true);
        return validationResult;
    };
    const createUserToFirebase = async (email, password) => {
        console.log(`createUserToFirebase`);
        const { signUp } = (0, firebase_1.useFirebase)();
        const user = await signUp(email, password);
        return user;
    };
    const onFailureCreateUserToFirebase = (error) => {
        console.log(`onFailureCreateUserToFirebase`);
        const { errMsgToStatusCodeAndMessage } = (0, firebase_1.useFirebase)();
        const message = error.message;
        const { statusCode, statusMessage } = errMsgToStatusCodeAndMessage(message);
        return { statusCode, statusMessage, message };
    };
    const createUserToDatabase = async (uid, email, displayName, tenantId) => {
        console.log(`createUserToDatabase`);
        const profile = await prisma.profile.create({
            data: {
                uid,
                email,
                displayName,
                tenantId: parseInt(tenantId),
            }
        });
        return JSON.stringify(profile);
    };
    const onFailureCreateUserToDatabase = async (idToken) => {
        console.log(`onFailureCreateUserToDatabase`);
        const { deleteUser } = (0, firebase_1.useFirebase)();
        await deleteUser(idToken);
    };
    const body = req.body;
    const { email, password, displayName, tenantId } = body;
    if (!email || !password || !displayName || !tenantId) {
        res
            .status(400)
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid request body',
        });
    }
    const validationResult = valid(email, password, displayName, tenantId);
    if (!validationResult) {
        res
            .status(400)
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Validation failed',
        });
    }
    const user = await createUserToFirebase(email, password);
    if (user.error) {
        const { statusCode, statusMessage, message } = onFailureCreateUserToFirebase(user.error);
        res
            .status(statusCode)
            .send({
            statusCode,
            statusMessage,
            message,
        });
    }
    try {
        const profile = await createUserToDatabase(user.localId, email, displayName, tenantId);
        res.send(profile);
    }
    catch (error) {
        await onFailureCreateUserToDatabase(user.idToken);
        res
            .status(400)
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Create to database failed',
        });
    }
});
router.get('/', async (req, res) => {
    const users = await prisma.profile.findMany();
    res
        .status(200)
        .send(users);
});
exports["default"] = router;


/***/ }),

/***/ "./src/utils/firebase.ts":
/*!*******************************!*\
  !*** ./src/utils/firebase.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useFirebase = void 0;
const useFirebase = () => {
    const apiKey = 'AIzaSyDIraHkuFWYdItWEydce1dbaAwBsRNNMeA';
    const baseUrl = `https://identitytoolkit.googleapis.com/v1`;
    const signUp = async (email, password) => {
        const endPoint = `accounts:signUp`;
        const url = `${baseUrl}/${endPoint}?key=${apiKey}`;
        const body = {
            email,
            password,
            returnSecureToken: true,
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return await response.json();
    };
    const deleteUser = async (idToken) => {
        const endPoint = `accounts:delete`;
        const url = `${baseUrl}/${endPoint}?key=${apiKey}`;
        const body = {
            idToken
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return await response.json();
    };
    const signInWithEmailAndPassword = async (email, password) => {
        const endPoint = `accounts:signInWithPassword`;
        const url = `${baseUrl}/${endPoint}?key=${apiKey}`;
        const body = {
            email,
            password,
            returnSecureToken: true,
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return await response.json();
    };
    const checkIdToken = async (req) => {
        const endPoint = `accounts:lookup`;
        const url = `${baseUrl}/${endPoint}?key=${apiKey}`;
        const idToken = req.headers.authorization;
        const body = { idToken };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const user = await response.json();
        return user;
    };
    const errMsgToStatusCodeAndMessage = (message) => {
        let statusCode;
        let statusMessage;
        switch (message) {
            case 'INVALID_PASSWORD':
            case 'EMAIL_NOT_FOUND':
                statusCode = 401;
                statusMessage = 'Unauthorized';
                break;
            case 'OPERATION_NOT_ALLOWED':
            case 'USER_DISABLED':
                statusCode = 403;
                statusMessage = 'Forbidden';
                break;
            case 'EMAIL_EXISTS':
                statusCode = 409;
                statusMessage = 'Conflict';
                break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                statusCode = 429;
                statusMessage = 'Too Many Requests';
                break;
            default:
                statusCode = 500;
                statusMessage = 'Internal Server Error';
                break;
        }
        return { statusCode, statusMessage };
    };
    return {
        signUp,
        deleteUser,
        signInWithEmailAndPassword,
        checkIdToken,
        errMsgToStatusCodeAndMessage,
    };
};
exports.useFirebase = useFirebase;


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

/***/ "validator":
/*!****************************!*\
  !*** external "validator" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("validator");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEdBQUcsR0FBRztnQkFDaEIsYUFBYSxHQUFHLHVCQUF1QjtnQkFDdkMsTUFBSztTQUNSO1FBQ0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUU7SUFDdEMsQ0FBQztJQUVELE9BQU87UUFDTCxNQUFNO1FBQ04sVUFBVTtRQUNWLDBCQUEwQjtRQUMxQixZQUFZO1FBQ1osNEJBQTRCO0tBQzdCO0FBQ0gsQ0FBQztBQXRIWSxtQkFBVyxlQXNIdkI7Ozs7Ozs7Ozs7O0FDeEhEOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL21pZGRsZXdhcmUvdmVyaWZ5LnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3JvdXRlcy9sb2dpbi50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvdXNlcnMudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvdXRpbHMvZmlyZWJhc2UudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJAcHJpc21hL2NsaWVudFwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiY29yc1wiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzc1wiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwidmFsaWRhdG9yXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuXG5pbXBvcnQgdXNlclJvdXRlciBmcm9tICcuL3JvdXRlcy91c2VycydcbmltcG9ydCBsb2dpblJvdXRlciBmcm9tICcuL3JvdXRlcy9sb2dpbidcblxuY29uc3QgYXBwID0gZXhwcmVzcygpXG5hcHAudXNlKGNvcnMoKSlcbmFwcC51c2UoZXhwcmVzcy5qc29uKCkpXG5hcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKVxuXG5jb25zdCBwb3J0ID0gMzAwMFxuXG5hcHAudXNlKCcvYXBpL3VzZXJzJywgdXNlclJvdXRlcilcbmFwcC51c2UoJy9hcGkvbG9naW4nLCBsb2dpblJvdXRlcilcblxuYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApXG59KVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gXCJzcmMvdXRpbHMvZmlyZWJhc2VcIlxuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgY2hlY2tJZFRva2VuIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjaGVja0lkVG9rZW4ocmVxKVxuXG4gIGlmICghdXNlci5lcnJvcikge1xuICAgIHJldHVybiBuZXh0KClcbiAgfVxuXG4gIHJlcy5zZW5kKHtcbiAgICBzdGF0dXNDb2RlOiB1c2VyLmVycm9yLmNvZGUsXG4gICAgc3RhdHVzTWVzc2FnZTogJ1VuYXV0aG9yaXplZCcsXG4gICAgbWVzc2FnZTogdXNlci5lcnJvci5tZXNzYWdlLFxuICB9KVxufVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tICdzcmMvdXRpbHMvZmlyZWJhc2UnXG5pbXBvcnQgeyB2ZXJpZnkgfSBmcm9tICcuLi9taWRkbGV3YXJlL3ZlcmlmeSdcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vKiogUE9TVCAvdXNlci9sb2dpbiAqL1xucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGxvZ2luYClcbiAgICBjb25zdCB7IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZClcblxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVMb2dpbiA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUxvZ2luYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgpLoqabjgb/jgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlTG9naW4odXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OBq+aIkOWKn+OBl+OBn+OCieOCr+ODg+OCreODvOOCkuS/neWtmOOBmeOCi1xuICBjb25zdCB0aW1lID0gNjAgKiA2MCAqIDEwMDBcbiAgY29uc3QgZXhwaXJlcyA9IG5ldyBEYXRlKERhdGUubm93KCkgKyB0aW1lKVxuXG4gIHJlcy5jb29raWUoJ3Rva2VuJywgdXNlci5pZFRva2VuLCB7XG4gICAgZXhwaXJlczogZXhwaXJlcyxcbiAgICAvLyBodHRwT25seTogdHJ1ZSxcbiAgICAvLyBzZWN1cmU6IHRydWUsXG4gIH0pXG5cbiAgcmVzXG4gIC5zZW5kKHtcbiAgICB1aWQ6IHVzZXIubG9jYWxJZCxcbiAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgfSlcbn0pXG5cbi8qKiBERUxFVEUgL3VzZXIvbG9naW4gKi9cbnJvdXRlci5kZWxldGUoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcbiAgdHJ5IHtcbiAgICByZXNcbiAgICAuY2xlYXJDb29raWUoJ3Rva2VuJylcbiAgICAuc2VuZCh7fSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXMuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcbiAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGVycm9yJyxcbiAgICB9KVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSAnc3JjL3V0aWxzL2ZpcmViYXNlJ1xuaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5pbXBvcnQgeyB2ZXJpZnkgfSBmcm9tICcuLi9taWRkbGV3YXJlL3ZlcmlmeSdcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpXG5cbi8qKiBQT1NUIC9hcGkvdXNlcnMgKi9cbnJvdXRlci5wb3N0KCcvJywgdmVyaWZ5LCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICAgIGRpc3BsYXlOYW1lOiBhbnksXG4gICAgdGVuYW50SWQ6IGFueSxcbiAgKSA9PiB7XG4gICAgY29uc3QgcnVsZUVtYWlsID0gKCkgPT4gdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpXG4gICAgY29uc3QgcnVsZVBhc3N3b3JkID0gKCkgPT4gdmFsaWRhdG9yLmlzU3Ryb25nUGFzc3dvcmQocGFzc3dvcmQsIHsgbWluTGVuZ3RoOiA2IH0pXG4gICAgY29uc3QgcnVsZURpc3BsYXlOYW1lID0gKCkgPT4ge1xuICAgICAgY29uc3QgaXNTb21lVGV4dCA9IFtcbiAgICAgICAgdmFsaWRhdG9yLmlzQXNjaWkoZGlzcGxheU5hbWUpLFxuICAgICAgICB2YWxpZGF0b3IuaXNNdWx0aWJ5dGUoZGlzcGxheU5hbWUpLFxuICAgICAgXS5zb21lKHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBbXG4gICAgICAgIGlzU29tZVRleHQsXG4gICAgICAgIHZhbGlkYXRvci5pc0xlbmd0aChkaXNwbGF5TmFtZSwgeyBtaW46IDEsIG1heDogMzIgfSksXG4gICAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICAgIHJldHVybiBpc1ZhbGlkXG4gICAgfVxuICAgIGNvbnN0IHJ1bGVUZW5hbnRJZCA9ICgpID0+IHZhbGlkYXRvci5pc0ludCh0ZW5hbnRJZClcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgICAgcnVsZURpc3BsYXlOYW1lKCksXG4gICAgICBydWxlVGVuYW50SWQoKSxcbiAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICByZXR1cm4gdmFsaWRhdGlvblJlc3VsdFxuICB9XG5cbiAgY29uc3QgY3JlYXRlVXNlclRvRmlyZWJhc2UgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBjcmVhdGVVc2VyVG9GaXJlYmFzZWApXG4gICAgY29uc3QgeyBzaWduVXAgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgc2lnblVwKGVtYWlsLCBwYXNzd29yZClcbiAgICByZXR1cm4gdXNlclxuICB9XG5cbiAgY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UgPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZWApXG4gICAgY29uc3QgeyBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfSA9IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UobWVzc2FnZSlcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH1cbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZVVzZXJUb0RhdGFiYXNlID0gYXN5bmMgKFxuICAgIHVpZDogc3RyaW5nLFxuICAgIGVtYWlsOiBzdHJpbmcsXG4gICAgZGlzcGxheU5hbWU6IHN0cmluZyxcbiAgICB0ZW5hbnRJZDogc3RyaW5nLFxuICAgICkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBjcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IHByaXNtYS5wcm9maWxlLmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHVpZCxcbiAgICAgICAgZW1haWwsXG4gICAgICAgIGRpc3BsYXlOYW1lLFxuICAgICAgICB0ZW5hbnRJZDogcGFyc2VJbnQodGVuYW50SWQpLFxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByb2ZpbGUpXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICAgIGNvbnN0IHsgZGVsZXRlVXNlciB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGF3YWl0IGRlbGV0ZVVzZXIoaWRUb2tlbilcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhZGlzcGxheU5hbWUgfHwgIXRlbmFudElkKSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlcXVlc3QgYm9keScsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODkOODquODh+ODvOOCt+ODp+ODs+OCkuihjOOBhOOAgTHjgaTjgafjgoLkuI3lkIjmoLzjga7loLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkKGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8gRmlyZWJhc2Xjgbjjg6bjg7zjgrbnmbvpjLLjgZnjgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UodXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc3RhdHVzKHN0YXR1c0NvZGUpXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZSxcbiAgICAgIHN0YXR1c01lc3NhZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg4fjg7zjgr/jg5njg7zjgrnjgbjjg5fjg63jg5XjgqPjg7zjg6vmg4XloLHjgpLnmbvpjLLjgZnjgotcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgY3JlYXRlVXNlclRvRGF0YWJhc2UodXNlci5sb2NhbElkLCBlbWFpbCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICAgIHJlcy5zZW5kKHByb2ZpbGUpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJRmlyZWJhc2XjgYvjgonjg4fjg7zjgr/jgpLliYrpmaTjgZfjgaZIVFRQ44K544OG44O844K/44K544Kz44O844OJ44KS6L+U44GZXG4gICAgYXdhaXQgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UodXNlci5pZFRva2VuKVxuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnQ3JlYXRlIHRvIGRhdGFiYXNlIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxufSlcblxuLyoqIEdFVCAvYXBpL3VzZXJzICovXG4vLyByb3V0ZXIuZ2V0KCcvJywgdmVyaWZ5LCBhc3luYyAocmVxLCByZXMpID0+IHtcbnJvdXRlci5nZXQoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdXNlcnMgPSBhd2FpdCBwcmlzbWEucHJvZmlsZS5maW5kTWFueSgpXG4gIHJlc1xuICAuc3RhdHVzKDIwMClcbiAgLnNlbmQodXNlcnMpXG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJ1xuXG5leHBvcnQgY29uc3QgdXNlRmlyZWJhc2UgPSAoKSA9PiB7XG4gIGNvbnN0IGFwaUtleSA9ICdBSXphU3lESXJhSGt1RldZZEl0V0V5ZGNlMWRiYUF3QnNSTk5NZUEnXG4gIGNvbnN0IGJhc2VVcmwgPSBgaHR0cHM6Ly9pZGVudGl0eXRvb2xraXQuZ29vZ2xlYXBpcy5jb20vdjFgXG5cbiAgY29uc3Qgc2lnblVwID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduVXBgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBkZWxldGVVc2VyID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmRlbGV0ZWBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGlkVG9rZW5cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduSW5XaXRoUGFzc3dvcmRgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBjaGVja0lkVG9rZW4gPSBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6bG9va3VwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBpZFRva2VuID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgIGNvbnN0IGJvZHkgPSB7IGlkVG9rZW4gfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHN0YXR1c0NvZGVcbiAgICBsZXQgc3RhdHVzTWVzc2FnZVxuXG4gICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICBjYXNlICdJTlZBTElEX1BBU1NXT1JEJzpcbiAgICAgIGNhc2UgJ0VNQUlMX05PVF9GT1VORCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDFcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdVbmF1dGhvcml6ZWQnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ09QRVJBVElPTl9OT1RfQUxMT1dFRCc6XG4gICAgICBjYXNlICdVU0VSX0RJU0FCTEVEJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwM1xuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ZvcmJpZGRlbidcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnRU1BSUxfRVhJU1RTJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0NvbmZsaWN0J1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdUT09fTUFOWV9BVFRFTVBUU19UUllfTEFURVInOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDI5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVG9vIE1hbnkgUmVxdWVzdHMnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA1MDBcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzaWduVXAsXG4gICAgZGVsZXRlVXNlcixcbiAgICBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCxcbiAgICBjaGVja0lkVG9rZW4sXG4gICAgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSxcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZhbGlkYXRvclwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9