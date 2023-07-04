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
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    res.cookie('token', user.idToken, {
        expires: expires,
    });
    res
        .send({
        uid: user.localId,
        email: user.email,
    });
});
router.delete('/', (req, res) => {
    try {
        console.log(`logout`);
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
    const checkAuthState = async (idToken) => {
        const endPoint = `accounts:lookup`;
        const url = `${baseUrl}/${endPoint}?key=${apiKey}`;
        const body = {
            idToken,
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return await response.json();
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
        checkAuthState,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q2hCLGFBQWEsR0FBRyxVQUFVO2dCQUMxQixNQUFLO1lBRVAsS0FBSyw2QkFBNkI7Z0JBQ2hDLFVBQVUsR0FBRyxHQUFHO2dCQUNoQixhQUFhLEdBQUcsbUJBQW1CO2dCQUNuQyxNQUFLO1lBRVA7Z0JBQ0UsVUFBVSxHQUFHLEdBQUc7Z0JBQ2hCLGFBQWEsR0FBRyx1QkFBdUI7Z0JBQ3ZDLE1BQUs7U0FDUjtRQUNELE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFO0lBQ3RDLENBQUM7SUFFRCxPQUFPO1FBQ0wsTUFBTTtRQUNOLFVBQVU7UUFDViwwQkFBMEI7UUFDMUIsY0FBYztRQUNkLDRCQUE0QjtLQUM3QjtBQUNILENBQUM7QUF0SFksbUJBQVcsZUFzSHZCOzs7Ozs7Ozs7OztBQ3RIRDs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL3VzZXJzLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL2ZpcmViYXNlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQHByaXNtYS9jbGllbnRcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImNvcnNcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcInZhbGlkYXRvclwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycydcblxuaW1wb3J0IHVzZXJSb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvdXNlcnMnXG5pbXBvcnQgbG9naW5Sb3V0ZXIgZnJvbSAnLi9yb3V0ZXMvbG9naW4nXG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKVxuYXBwLnVzZShjb3JzKCkpXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKVxuYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSlcblxuY29uc3QgcG9ydCA9IDMwMDBcblxuYXBwLnVzZSgnL2FwaS91c2VycycsIHVzZXJSb3V0ZXIpXG5hcHAudXNlKCcvYXBpL2xvZ2luJywgbG9naW5Sb3V0ZXIpXG5cbmFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhgTGlzdGVuaW5nIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9gKVxufSlcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSAnc3JjL3V0aWxzL2ZpcmViYXNlJ1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vKiogUE9TVCAvdXNlci9sb2dpbiAqL1xucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGxvZ2luYClcbiAgICBjb25zdCB7IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZClcblxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVMb2dpbiA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUxvZ2luYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgpLoqabjgb/jgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlTG9naW4odXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OBq+aIkOWKn+OBl+OBn+OCieOCr+ODg+OCreODvOOCkuS/neWtmOOBmeOCi1xuICBjb25zdCBleHBpcmVzID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIDYwICogNjAgKiAxMDAwKVxuICByZXMuY29va2llKCd0b2tlbicsIHVzZXIuaWRUb2tlbiwge1xuICAgIGV4cGlyZXM6IGV4cGlyZXMsXG4gICAgLy8gaHR0cE9ubHk6IHRydWUsXG4gICAgLy8gc2VjdXJlOiB0cnVlLFxuICB9KVxuXG4gIHJlc1xuICAuc2VuZCh7XG4gICAgdWlkOiB1c2VyLmxvY2FsSWQsXG4gICAgZW1haWw6IHVzZXIuZW1haWwsXG4gIH0pXG59KVxuXG4vKiogREVMRVRFIC91c2VyL2xvZ2luICovXG5yb3V0ZXIuZGVsZXRlKCcvJywgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coYGxvZ291dGApXG4gICAgcmVzXG4gICAgLmNsZWFyQ29va2llKCd0b2tlbicpXG4gICAgLnNlbmQoe30pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVzLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0ludGVybmFsIFNlcnZlciBFcnJvcicsXG4gICAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBlcnJvcicsXG4gICAgfSlcbiAgfVxufSlcbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tICdzcmMvdXRpbHMvZmlyZWJhc2UnXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQgfSA9IGJvZHlcblxuICAvLyDjg6rjgq/jgqjjgrnjg4jjg5zjg4fjgqPjgafmuKHjgZXjgozjgZ9KU09O44OH44O844K/44GM5LiN5q2j44Gq5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGlmICghZW1haWwgfHwgIXBhc3N3b3JkIHx8ICFkaXNwbGF5TmFtZSB8fCAhdGVuYW50SWQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdCBib2R5JyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQoZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyBGaXJlYmFzZeOBuOODpuODvOOCtueZu+mMsuOBmeOCi1xuICBjb25zdCB1c2VyID0gYXdhaXQgY3JlYXRlVXNlclRvRmlyZWJhc2UoZW1haWwsIHBhc3N3b3JkKVxuICBpZiAodXNlci5lcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgajjg6Hjg4Pjgrvjg7zjgrjjgpLlkKvjgoBKU09O44OH44O844K/44KS6L+U44GZXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH0gPSBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZSh1c2VyLmVycm9yKVxuICAgIHJlc1xuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGUsXG4gICAgICBzdGF0dXNNZXNzYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OH44O844K/44OZ44O844K544G444OX44Ot44OV44Kj44O844Or5oOF5aCx44KS55m76Yyy44GZ44KLXG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGNyZWF0ZVVzZXJUb0RhdGFiYXNlKHVzZXIubG9jYWxJZCwgZW1haWwsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZClcbiAgICByZXMuc2VuZChwcm9maWxlKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUZpcmViYXNl44GL44KJ44OH44O844K/44KS5YmK6Zmk44GX44GmSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOCkui/lOOBmVxuICAgIGF3YWl0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlKHVzZXIuaWRUb2tlbilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0NyZWF0ZSB0byBkYXRhYmFzZSBmYWlsZWQnLFxuICAgIH0pXG4gIH1cbn0pXG5cbmNvbnN0IHZhbGlkID0gKFxuICBlbWFpbDogYW55LFxuICBwYXNzd29yZDogYW55LFxuICBkaXNwbGF5TmFtZTogYW55LFxuICB0ZW5hbnRJZDogYW55LFxuKSA9PiB7XG4gIGNvbnN0IHJ1bGVFbWFpbCA9ICgpID0+IHZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKVxuICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcbiAgY29uc3QgcnVsZURpc3BsYXlOYW1lID0gKCkgPT4ge1xuICAgIGNvbnN0IGlzU29tZVRleHQgPSBbXG4gICAgICB2YWxpZGF0b3IuaXNBc2NpaShkaXNwbGF5TmFtZSksXG4gICAgICB2YWxpZGF0b3IuaXNNdWx0aWJ5dGUoZGlzcGxheU5hbWUpLFxuICAgIF0uc29tZShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgY29uc3QgaXNWYWxpZCA9IFtcbiAgICAgIGlzU29tZVRleHQsXG4gICAgICB2YWxpZGF0b3IuaXNMZW5ndGgoZGlzcGxheU5hbWUsIHsgbWluOiAxLCBtYXg6IDMyIH0pLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiBpc1ZhbGlkXG4gIH1cbiAgY29uc3QgcnVsZVRlbmFudElkID0gKCkgPT4gdmFsaWRhdG9yLmlzSW50KHRlbmFudElkKVxuXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgcnVsZUVtYWlsKCksXG4gICAgcnVsZVBhc3N3b3JkKCksXG4gICAgcnVsZURpc3BsYXlOYW1lKCksXG4gICAgcnVsZVRlbmFudElkKCksXG4gIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICByZXR1cm4gdmFsaWRhdGlvblJlc3VsdFxufVxuXG5jb25zdCBjcmVhdGVVc2VyVG9GaXJlYmFzZSA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBjcmVhdGVVc2VyVG9GaXJlYmFzZWApXG4gIGNvbnN0IHsgc2lnblVwIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBzaWduVXAoZW1haWwsIHBhc3N3b3JkKVxuICByZXR1cm4gdXNlclxufVxuXG5jb25zdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZSA9IChlcnJvcjogYW55KSA9PiB7XG4gIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZWApXG4gIGNvbnN0IHsgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSB9ID0gdXNlRmlyZWJhc2UoKVxuICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfSA9IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UobWVzc2FnZSlcbiAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9XG59XG5cbmNvbnN0IGNyZWF0ZVVzZXJUb0RhdGFiYXNlID0gYXN5bmMgKFxuICB1aWQ6IHN0cmluZyxcbiAgZW1haWw6IHN0cmluZyxcbiAgZGlzcGxheU5hbWU6IHN0cmluZyxcbiAgdGVuYW50SWQ6IHN0cmluZyxcbiAgKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBjcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gIGNvbnN0IHByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKVxuICBjb25zdCBwcm9maWxlID0gYXdhaXQgcHJpc21hLnByb2ZpbGUuY3JlYXRlKHtcbiAgICBkYXRhOiB7XG4gICAgICB1aWQsXG4gICAgICBlbWFpbCxcbiAgICAgIGRpc3BsYXlOYW1lLFxuICAgICAgdGVuYW50SWQ6IHBhcnNlSW50KHRlbmFudElkKSxcbiAgICB9XG4gIH0pXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwcm9maWxlKVxufVxuXG5jb25zdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgY29uc29sZS5sb2coYG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlYClcbiAgY29uc3QgeyBkZWxldGVVc2VyIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGF3YWl0IGRlbGV0ZVVzZXIoaWRUb2tlbilcbn1cblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJleHBvcnQgY29uc3QgdXNlRmlyZWJhc2UgPSAoKSA9PiB7XG4gIGNvbnN0IGFwaUtleSA9ICdBSXphU3lESXJhSGt1RldZZEl0V0V5ZGNlMWRiYUF3QnNSTk5NZUEnXG4gIGNvbnN0IGJhc2VVcmwgPSBgaHR0cHM6Ly9pZGVudGl0eXRvb2xraXQuZ29vZ2xlYXBpcy5jb20vdjFgXG5cbiAgY29uc3Qgc2lnblVwID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduVXBgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBkZWxldGVVc2VyID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmRlbGV0ZWBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGlkVG9rZW5cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduSW5XaXRoUGFzc3dvcmRgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBjaGVja0F1dGhTdGF0ZSA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpsb29rdXBgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBpZFRva2VuLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgc3RhdHVzQ29kZVxuICAgIGxldCBzdGF0dXNNZXNzYWdlXG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgIGNhc2UgJ0lOVkFMSURfUEFTU1dPUkQnOlxuICAgICAgY2FzZSAnRU1BSUxfTk9UX0ZPVU5EJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwMVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ1VuYXV0aG9yaXplZCdcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnT1BFUkFUSU9OX05PVF9BTExPV0VEJzpcbiAgICAgIGNhc2UgJ1VTRVJfRElTQUJMRUQnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDAzXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnRm9yYmlkZGVuJ1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdFTUFJTF9FWElTVFMnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDA5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnQ29uZmxpY3QnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ1RPT19NQU5ZX0FUVEVNUFRTX1RSWV9MQVRFUic6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MjlcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdUb28gTWFueSBSZXF1ZXN0cydcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDUwMFxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ludGVybmFsIFNlcnZlciBFcnJvcidcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNpZ25VcCxcbiAgICBkZWxldGVVc2VyLFxuICAgIHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkLFxuICAgIGNoZWNrQXV0aFN0YXRlLFxuICAgIGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UsXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBwcmlzbWEvY2xpZW50XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ2YWxpZGF0b3JcIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==