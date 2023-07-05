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
const router = express_1.default.Router();
router.post('/', async (req, res) => {
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
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Create to database failed',
        });
    }
});
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
    const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9taWRkbGV3YXJlL3ZlcmlmeS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL3VzZXJzLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL2ZpcmViYXNlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQHByaXNtYS9jbGllbnRcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImNvcnNcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcInZhbGlkYXRvclwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycydcblxuaW1wb3J0IHVzZXJSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvdXNlcnMnXG5pbXBvcnQgbG9naW5Sb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvbG9naW4nXG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKVxuYXBwLnVzZShjb3JzKCkpXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKVxuYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSlcblxuY29uc3QgcG9ydCA9IDMwMDBcblxuYXBwLnVzZSgnL2FwaS91c2VycycsIHVzZXJSb3V0ZXIpXG5hcHAudXNlKCcvYXBpL2xvZ2luJywgbG9naW5Sb3V0ZXIpXG5cbmFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhgTGlzdGVuaW5nIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9gKVxufSlcbiIsImltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlLCBOZXh0RnVuY3Rpb24gfSBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tIFwic3JjL3V0aWxzL2ZpcmViYXNlXCJcblxuZXhwb3J0IGNvbnN0IHZlcmlmeSA9IGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICBjb25zdCB7IGNoZWNrSWRUb2tlbiB9ID0gdXNlRmlyZWJhc2UoKVxuICBjb25zdCB1c2VyID0gYXdhaXQgY2hlY2tJZFRva2VuKHJlcSlcblxuICBpZiAoIXVzZXIuZXJyb3IpIHtcbiAgICByZXR1cm4gbmV4dCgpXG4gIH1cblxuICByZXMuc2VuZCh7XG4gICAgc3RhdHVzQ29kZTogdXNlci5lcnJvci5jb2RlLFxuICAgIHN0YXR1c01lc3NhZ2U6ICdVbmF1dGhvcml6ZWQnLFxuICAgIG1lc3NhZ2U6IHVzZXIuZXJyb3IubWVzc2FnZSxcbiAgfSlcbn1cbiIsImltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcydcbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSAnc3JjL3V0aWxzL2ZpcmViYXNlJ1xuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSAnLi4vbWlkZGxld2FyZS92ZXJpZnknXG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLyoqIFBPU1QgL3VzZXIvbG9naW4gKi9cbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHZhbGlkID0gKFxuICAgIGVtYWlsOiBhbnksXG4gICAgcGFzc3dvcmQ6IGFueSxcbiAgKSA9PiB7XG4gICAgY29uc3QgcnVsZUVtYWlsID0gKCkgPT4gdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpXG4gICAgY29uc3QgcnVsZVBhc3N3b3JkID0gKCkgPT4gdmFsaWRhdG9yLmlzU3Ryb25nUGFzc3dvcmQocGFzc3dvcmQsIHsgbWluTGVuZ3RoOiA2IH0pXG5cbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgcnVsZUVtYWlsKCksXG4gICAgICBydWxlUGFzc3dvcmQoKSxcbiAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICByZXR1cm4gdmFsaWRhdGlvblJlc3VsdFxuICB9XG5cbiAgY29uc3QgbG9naW4gPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBsb2dpbmApXG4gICAgY29uc3QgeyBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpXG5cbiAgICByZXR1cm4gdXNlclxuICB9XG5cbiAgY29uc3Qgb25GYWlsdXJlTG9naW4gPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVMb2dpbmApXG4gICAgY29uc3QgeyBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfSA9IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UobWVzc2FnZSlcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH1cbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gYm9keVxuXG4gIC8vIOODquOCr+OCqOOCueODiOODnOODh+OCo+OBp+a4oeOBleOCjOOBn0pTT07jg4fjg7zjgr/jgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdCBib2R5JyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQoZW1haWwsIHBhc3N3b3JkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44Ot44Kw44Kk44Oz44KS6Kmm44G/44KLXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBsb2dpbihlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICh1c2VyLmVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOBqOODoeODg+OCu+ODvOOCuOOCkuWQq+OCgEpTT07jg4fjg7zjgr/jgpLov5TjgZlcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfSA9IG9uRmFpbHVyZUxvZ2luKHVzZXIuZXJyb3IpXG4gICAgcmVzXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZSxcbiAgICAgIHN0YXR1c01lc3NhZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgavmiJDlip/jgZfjgZ/jgonjgq/jg4Pjgq3jg7zjgpLkv53lrZjjgZnjgotcbiAgY29uc3QgdGltZSA9IDYwICogNjAgKiAxMDAwXG4gIGNvbnN0IGV4cGlyZXMgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgdGltZSlcblxuICByZXMuY29va2llKCd0b2tlbicsIHVzZXIuaWRUb2tlbiwge1xuICAgIGV4cGlyZXM6IGV4cGlyZXMsXG4gICAgLy8gaHR0cE9ubHk6IHRydWUsXG4gICAgLy8gc2VjdXJlOiB0cnVlLFxuICB9KVxuXG4gIHJlc1xuICAuc2VuZCh7XG4gICAgdWlkOiB1c2VyLmxvY2FsSWQsXG4gICAgZW1haWw6IHVzZXIuZW1haWwsXG4gIH0pXG59KVxuXG4vKiogREVMRVRFIC91c2VyL2xvZ2luICovXG5yb3V0ZXIuZGVsZXRlKCcvJywgdmVyaWZ5LCBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG4gIHRyeSB7XG4gICAgcmVzXG4gICAgLmNsZWFyQ29va2llKCd0b2tlbicpXG4gICAgLnNlbmQoe30pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVzLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0ludGVybmFsIFNlcnZlciBFcnJvcicsXG4gICAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBlcnJvcicsXG4gICAgfSlcbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICd2YWxpZGF0b3InXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vKiogUE9TVCAvYXBpL3VzZXJzICovXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBib2R5ID0gcmVxLmJvZHlcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZCB9ID0gYm9keVxuXG4gIC8vIOODquOCr+OCqOOCueODiOODnOODh+OCo+OBp+a4oeOBleOCjOOBn0pTT07jg4fjg7zjgr/jgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIWRpc3BsYXlOYW1lIHx8ICF0ZW5hbnRJZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZClcbiAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZpcmViYXNl44G444Om44O844K255m76Yyy44GZ44KLXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjcmVhdGVVc2VyVG9GaXJlYmFzZShlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICh1c2VyLmVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOBqOODoeODg+OCu+ODvOOCuOOCkuWQq+OCgEpTT07jg4fjg7zjgr/jgpLov5TjgZlcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfSA9IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlKHVzZXIuZXJyb3IpXG4gICAgcmVzXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZSxcbiAgICAgIHN0YXR1c01lc3NhZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg4fjg7zjgr/jg5njg7zjgrnjgbjjg5fjg63jg5XjgqPjg7zjg6vmg4XloLHjgpLnmbvpjLLjgZnjgotcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgY3JlYXRlVXNlclRvRGF0YWJhc2UodXNlci5sb2NhbElkLCBlbWFpbCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICAgIHJlcy5zZW5kKHByb2ZpbGUpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJRmlyZWJhc2XjgYvjgonjg4fjg7zjgr/jgpLliYrpmaTjgZfjgaZIVFRQ44K544OG44O844K/44K544Kz44O844OJ44KS6L+U44GZXG4gICAgYXdhaXQgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UodXNlci5pZFRva2VuKVxuICAgIHJlc1xuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnQ3JlYXRlIHRvIGRhdGFiYXNlIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxufSlcblxuY29uc3QgdmFsaWQgPSAoXG4gIGVtYWlsOiBhbnksXG4gIHBhc3N3b3JkOiBhbnksXG4gIGRpc3BsYXlOYW1lOiBhbnksXG4gIHRlbmFudElkOiBhbnksXG4pID0+IHtcbiAgY29uc3QgcnVsZUVtYWlsID0gKCkgPT4gdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpXG4gIGNvbnN0IHJ1bGVQYXNzd29yZCA9ICgpID0+IHZhbGlkYXRvci5pc1N0cm9uZ1Bhc3N3b3JkKHBhc3N3b3JkLCB7IG1pbkxlbmd0aDogNiB9KVxuICBjb25zdCBydWxlRGlzcGxheU5hbWUgPSAoKSA9PiB7XG4gICAgY29uc3QgaXNTb21lVGV4dCA9IFtcbiAgICAgIHZhbGlkYXRvci5pc0FzY2lpKGRpc3BsYXlOYW1lKSxcbiAgICAgIHZhbGlkYXRvci5pc011bHRpYnl0ZShkaXNwbGF5TmFtZSksXG4gICAgXS5zb21lKHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICBjb25zdCBpc1ZhbGlkID0gW1xuICAgICAgaXNTb21lVGV4dCxcbiAgICAgIHZhbGlkYXRvci5pc0xlbmd0aChkaXNwbGF5TmFtZSwgeyBtaW46IDEsIG1heDogMzIgfSksXG4gICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgcmV0dXJuIGlzVmFsaWRcbiAgfVxuICBjb25zdCBydWxlVGVuYW50SWQgPSAoKSA9PiB2YWxpZGF0b3IuaXNJbnQodGVuYW50SWQpXG5cbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IFtcbiAgICBydWxlRW1haWwoKSxcbiAgICBydWxlUGFzc3dvcmQoKSxcbiAgICBydWxlRGlzcGxheU5hbWUoKSxcbiAgICBydWxlVGVuYW50SWQoKSxcbiAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG59XG5cbmNvbnN0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgY29uc29sZS5sb2coYGNyZWF0ZVVzZXJUb0ZpcmViYXNlYClcbiAgY29uc3QgeyBzaWduVXAgfSA9IHVzZUZpcmViYXNlKClcbiAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25VcChlbWFpbCwgcGFzc3dvcmQpXG4gIHJldHVybiB1c2VyXG59XG5cbmNvbnN0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlID0gKGVycm9yOiBhbnkpID0+IHtcbiAgY29uc29sZS5sb2coYG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlYClcbiAgY29uc3QgeyBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH1cbn1cblxuY29uc3QgY3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoXG4gIHVpZDogc3RyaW5nLFxuICBlbWFpbDogc3RyaW5nLFxuICBkaXNwbGF5TmFtZTogc3RyaW5nLFxuICB0ZW5hbnRJZDogc3RyaW5nLFxuICApID0+IHtcbiAgY29uc29sZS5sb2coYGNyZWF0ZVVzZXJUb0RhdGFiYXNlYClcbiAgY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpXG4gIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBwcmlzbWEucHJvZmlsZS5jcmVhdGUoe1xuICAgIGRhdGE6IHtcbiAgICAgIHVpZCxcbiAgICAgIGVtYWlsLFxuICAgICAgZGlzcGxheU5hbWUsXG4gICAgICB0ZW5hbnRJZDogcGFyc2VJbnQodGVuYW50SWQpLFxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByb2ZpbGUpXG59XG5cbmNvbnN0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICBjb25zdCB7IGRlbGV0ZVVzZXIgfSA9IHVzZUZpcmViYXNlKClcbiAgYXdhaXQgZGVsZXRlVXNlcihpZFRva2VuKVxufVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJ1xuXG5leHBvcnQgY29uc3QgdXNlRmlyZWJhc2UgPSAoKSA9PiB7XG4gIGNvbnN0IGFwaUtleSA9ICdBSXphU3lESXJhSGt1RldZZEl0V0V5ZGNlMWRiYUF3QnNSTk5NZUEnXG4gIGNvbnN0IGJhc2VVcmwgPSBgaHR0cHM6Ly9pZGVudGl0eXRvb2xraXQuZ29vZ2xlYXBpcy5jb20vdjFgXG5cbiAgY29uc3Qgc2lnblVwID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduVXBgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBkZWxldGVVc2VyID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmRlbGV0ZWBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGlkVG9rZW5cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduSW5XaXRoUGFzc3dvcmRgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBjaGVja0lkVG9rZW4gPSBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6bG9va3VwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBpZFRva2VuID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgIGNvbnN0IGJvZHkgPSB7IGlkVG9rZW4gfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHN0YXR1c0NvZGVcbiAgICBsZXQgc3RhdHVzTWVzc2FnZVxuXG4gICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICBjYXNlICdJTlZBTElEX1BBU1NXT1JEJzpcbiAgICAgIGNhc2UgJ0VNQUlMX05PVF9GT1VORCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDFcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdVbmF1dGhvcml6ZWQnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ09QRVJBVElPTl9OT1RfQUxMT1dFRCc6XG4gICAgICBjYXNlICdVU0VSX0RJU0FCTEVEJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwM1xuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ZvcmJpZGRlbidcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnRU1BSUxfRVhJU1RTJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0NvbmZsaWN0J1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdUT09fTUFOWV9BVFRFTVBUU19UUllfTEFURVInOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDI5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVG9vIE1hbnkgUmVxdWVzdHMnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA1MDBcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzaWduVXAsXG4gICAgZGVsZXRlVXNlcixcbiAgICBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCxcbiAgICBjaGVja0lkVG9rZW4sXG4gICAgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSxcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZhbGlkYXRvclwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9