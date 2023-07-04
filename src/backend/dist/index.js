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
    res.cookie('token', user.idToken, {
        httpOnly: true,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtnQkFDbkMsTUFBSztZQUVQO2dCQUNFLFVBQVUsR0FBRyxHQUFHO2dCQUNoQixhQUFhLEdBQUcsdUJBQXVCO2dCQUN2QyxNQUFLO1NBQ1I7UUFDRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRTtJQUN0QyxDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU07UUFDTixVQUFVO1FBQ1YsMEJBQTBCO1FBQzFCLGNBQWM7UUFDZCw0QkFBNEI7S0FDN0I7QUFDSCxDQUFDO0FBdEhZLG1CQUFXLGVBc0h2Qjs7Ozs7Ozs7Ozs7QUN0SEQ7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9hcHAudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL2xvZ2luLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3JvdXRlcy91c2Vycy50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy91dGlscy9maXJlYmFzZS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcIkBwcmlzbWEvY2xpZW50XCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJjb3JzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJ2YWxpZGF0b3JcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnXG5cbmltcG9ydCB1c2VyUm91dGVyIGZyb20gJy4vcm91dGVzL3VzZXJzJ1xuaW1wb3J0IGxvZ2luUm91dGVyIGZyb20gJy4vcm91dGVzL2xvZ2luJ1xuXG5jb25zdCBhcHAgPSBleHByZXNzKClcbmFwcC51c2UoY29ycygpKVxuYXBwLnVzZShleHByZXNzLmpzb24oKSlcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpXG5cbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoJy9hcGkvdXNlcnMnLCB1c2VyUm91dGVyKVxuYXBwLnVzZSgnL2FwaS9sb2dpbicsIGxvZ2luUm91dGVyKVxuXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYExpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vYClcbn0pXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICd2YWxpZGF0b3InXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLy8gUE9TVCAvdXNlci9sb2dpblxucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGxvZ2luYClcbiAgICBjb25zdCB7IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZClcblxuICAgIHJldHVybiB1c2VyXG4gIH1cbiAgY29uc3Qgb25GYWlsdXJlTG9naW4gPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVMb2dpbmApXG4gICAgY29uc3QgeyBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfSA9IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UobWVzc2FnZSlcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH1cbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gYm9keVxuXG4gIC8vIOODquOCr+OCqOOCueODiOODnOODh+OCo+OBp+a4oeOBleOCjOOBn0pTT07jg4fjg7zjgr/jgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdCBib2R5JyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQoZW1haWwsIHBhc3N3b3JkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44Ot44Kw44Kk44Oz44KS6Kmm44G/44KLXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBsb2dpbihlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICh1c2VyLmVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOBqOODoeODg+OCu+ODvOOCuOOCkuWQq+OCgEpTT07jg4fjg7zjgr/jgpLov5TjgZlcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfSA9IG9uRmFpbHVyZUxvZ2luKHVzZXIuZXJyb3IpXG4gICAgcmVzXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZSxcbiAgICAgIHN0YXR1c01lc3NhZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgavmiJDlip/jgZfjgZ/jgonjgq/jg4Pjgq3jg7zjgpLkv53lrZjjgZnjgotcbiAgcmVzLmNvb2tpZSgndG9rZW4nLCB1c2VyLmlkVG9rZW4sIHtcbiAgICBodHRwT25seTogdHJ1ZSxcbiAgICAvLyBzZWN1cmU6IHRydWUsXG4gIH0pXG5cbiAgcmVzXG4gIC5zZW5kKHtcbiAgICB1aWQ6IHVzZXIubG9jYWxJZCxcbiAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgfSlcbn0pXG5cbi8vIERFTEVURSAvdXNlci9sb2dpblxucm91dGVyLmRlbGV0ZSgnLycsIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBsb2dvdXRgKVxuICAgIHJlc1xuICAgIC5jbGVhckNvb2tpZSgndG9rZW4nKVxuICAgIC5zZW5kKHt9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlcy5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxuICAgICAgbWVzc2FnZTogJ1VuZXhwZWN0ZWQgZXJyb3InLFxuICAgIH0pXG4gIH1cbn0pXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSAnc3JjL3V0aWxzL2ZpcmViYXNlJ1xuaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhZGlzcGxheU5hbWUgfHwgIXRlbmFudElkKSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlcXVlc3QgYm9keScsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODkOODquODh+ODvOOCt+ODp+ODs+OCkuihjOOBhOOAgTHjgaTjgafjgoLkuI3lkIjmoLzjga7loLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkKGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8gRmlyZWJhc2Xjgbjjg6bjg7zjgrbnmbvpjLLjgZnjgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UodXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODh+ODvOOCv+ODmeODvOOCueOBuOODl+ODreODleOCo+ODvOODq+aDheWgseOCkueZu+mMsuOBmeOCi1xuICB0cnkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmxvY2FsSWQsIGVtYWlsLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gICAgcmVzLnNlbmQocHJvZmlsZSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolGaXJlYmFzZeOBi+OCieODh+ODvOOCv+OCkuWJiumZpOOBl+OBpkhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgpLov5TjgZlcbiAgICBhd2FpdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmlkVG9rZW4pXG4gICAgcmVzXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdDcmVhdGUgdG8gZGF0YWJhc2UgZmFpbGVkJyxcbiAgICB9KVxuICB9XG59KVxuXG5jb25zdCB2YWxpZCA9IChcbiAgZW1haWw6IGFueSxcbiAgcGFzc3dvcmQ6IGFueSxcbiAgZGlzcGxheU5hbWU6IGFueSxcbiAgdGVuYW50SWQ6IGFueSxcbikgPT4ge1xuICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgY29uc3QgcnVsZVBhc3N3b3JkID0gKCkgPT4gdmFsaWRhdG9yLmlzU3Ryb25nUGFzc3dvcmQocGFzc3dvcmQsIHsgbWluTGVuZ3RoOiA2IH0pXG4gIGNvbnN0IHJ1bGVEaXNwbGF5TmFtZSA9ICgpID0+IHtcbiAgICBjb25zdCBpc1NvbWVUZXh0ID0gW1xuICAgICAgdmFsaWRhdG9yLmlzQXNjaWkoZGlzcGxheU5hbWUpLFxuICAgICAgdmFsaWRhdG9yLmlzTXVsdGlieXRlKGRpc3BsYXlOYW1lKSxcbiAgICBdLnNvbWUocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIGNvbnN0IGlzVmFsaWQgPSBbXG4gICAgICBpc1NvbWVUZXh0LFxuICAgICAgdmFsaWRhdG9yLmlzTGVuZ3RoKGRpc3BsYXlOYW1lLCB7IG1pbjogMSwgbWF4OiAzMiB9KSxcbiAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICByZXR1cm4gaXNWYWxpZFxuICB9XG4gIGNvbnN0IHJ1bGVUZW5hbnRJZCA9ICgpID0+IHZhbGlkYXRvci5pc0ludCh0ZW5hbnRJZClcblxuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgIHJ1bGVFbWFpbCgpLFxuICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIHJ1bGVEaXNwbGF5TmFtZSgpLFxuICAgIHJ1bGVUZW5hbnRJZCgpLFxuICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbn1cblxuY29uc3QgY3JlYXRlVXNlclRvRmlyZWJhc2UgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICBjb25zdCB7IHNpZ25VcCB9ID0gdXNlRmlyZWJhc2UoKVxuICBjb25zdCB1c2VyID0gYXdhaXQgc2lnblVwKGVtYWlsLCBwYXNzd29yZClcbiAgcmV0dXJuIHVzZXJcbn1cblxuY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UgPSAoZXJyb3I6IGFueSkgPT4ge1xuICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH0gPSBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlKG1lc3NhZ2UpXG4gIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxufVxuXG5jb25zdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChcbiAgdWlkOiBzdHJpbmcsXG4gIGVtYWlsOiBzdHJpbmcsXG4gIGRpc3BsYXlOYW1lOiBzdHJpbmcsXG4gIHRlbmFudElkOiBzdHJpbmcsXG4gICkgPT4ge1xuICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICBjb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcbiAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IHByaXNtYS5wcm9maWxlLmNyZWF0ZSh7XG4gICAgZGF0YToge1xuICAgICAgdWlkLFxuICAgICAgZW1haWwsXG4gICAgICBkaXNwbGF5TmFtZSxcbiAgICAgIHRlbmFudElkOiBwYXJzZUludCh0ZW5hbnRJZCksXG4gICAgfVxuICB9KVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvZmlsZSlcbn1cblxuY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoaWRUb2tlbjogc3RyaW5nKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gIGNvbnN0IHsgZGVsZXRlVXNlciB9ID0gdXNlRmlyZWJhc2UoKVxuICBhd2FpdCBkZWxldGVVc2VyKGlkVG9rZW4pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiZXhwb3J0IGNvbnN0IHVzZUZpcmViYXNlID0gKCkgPT4ge1xuICBjb25zdCBhcGlLZXkgPSAnQUl6YVN5RElyYUhrdUZXWWRJdFdFeWRjZTFkYmFBd0JzUk5OTWVBJ1xuICBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxYFxuXG4gIGNvbnN0IHNpZ25VcCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnblVwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlVXNlciA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpkZWxldGVgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBpZFRva2VuXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnbkluV2l0aFBhc3N3b3JkYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgY2hlY2tBdXRoU3RhdGUgPSBhc3luYyAoaWRUb2tlbjogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6bG9va3VwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgaWRUb2tlbixcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHN0YXR1c0NvZGVcbiAgICBsZXQgc3RhdHVzTWVzc2FnZVxuXG4gICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICBjYXNlICdJTlZBTElEX1BBU1NXT1JEJzpcbiAgICAgIGNhc2UgJ0VNQUlMX05PVF9GT1VORCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDFcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdVbmF1dGhvcml6ZWQnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ09QRVJBVElPTl9OT1RfQUxMT1dFRCc6XG4gICAgICBjYXNlICdVU0VSX0RJU0FCTEVEJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwM1xuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ZvcmJpZGRlbidcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnRU1BSUxfRVhJU1RTJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0NvbmZsaWN0J1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdUT09fTUFOWV9BVFRFTVBUU19UUllfTEFURVInOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDI5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVG9vIE1hbnkgUmVxdWVzdHMnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA1MDBcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzaWduVXAsXG4gICAgZGVsZXRlVXNlcixcbiAgICBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCxcbiAgICBjaGVja0F1dGhTdGF0ZSxcbiAgICBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlLFxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAcHJpc21hL2NsaWVudFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidmFsaWRhdG9yXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=