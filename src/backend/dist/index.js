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
    const verify = async (idToken) => {
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
        verify,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Z0JBQ2pCLFVBQVUsR0FBRyxHQUFHO2dCQUNoQixhQUFhLEdBQUcsVUFBVTtnQkFDMUIsTUFBSztZQUVQLEtBQUssNkJBQTZCO2dCQUNoQyxVQUFVLEdBQUcsR0FBRztnQkFDaEIsYUFBYSxHQUFHLG1CQUFtQjtnQkFDbkMsTUFBSztZQUVQO2dCQUNFLFVBQVUsR0FBRyxHQUFHO2dCQUNoQixhQUFhLEdBQUcsdUJBQXVCO2dCQUN2QyxNQUFLO1NBQ1I7UUFDRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRTtJQUN0QyxDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU07UUFDTixVQUFVO1FBQ1YsMEJBQTBCO1FBQzFCLE1BQU07UUFDTiw0QkFBNEI7S0FDN0I7QUFDSCxDQUFDO0FBdkhZLG1CQUFXLGVBdUh2Qjs7Ozs7Ozs7Ozs7QUN2SEQ7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9hcHAudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL2xvZ2luLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3JvdXRlcy91c2Vycy50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy91dGlscy9maXJlYmFzZS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcIkBwcmlzbWEvY2xpZW50XCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJjb3JzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJ2YWxpZGF0b3JcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnXG5cbmltcG9ydCB1c2VyUm91dGVyIGZyb20gJy4vcm91dGVzL3VzZXJzJ1xuaW1wb3J0IGxvZ2luUm91dGVyIGZyb20gJy4vcm91dGVzL2xvZ2luJ1xuXG5jb25zdCBhcHAgPSBleHByZXNzKClcbmFwcC51c2UoY29ycygpKVxuYXBwLnVzZShleHByZXNzLmpzb24oKSlcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpXG5cbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoJy9hcGkvdXNlcnMnLCB1c2VyUm91dGVyKVxuYXBwLnVzZSgnL2FwaS9sb2dpbicsIGxvZ2luUm91dGVyKVxuXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYExpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vYClcbn0pXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICd2YWxpZGF0b3InXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcblxuLyoqIFBPU1QgL3VzZXIvbG9naW4gKi9cbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHZhbGlkID0gKFxuICAgIGVtYWlsOiBhbnksXG4gICAgcGFzc3dvcmQ6IGFueSxcbiAgKSA9PiB7XG4gICAgY29uc3QgcnVsZUVtYWlsID0gKCkgPT4gdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpXG4gICAgY29uc3QgcnVsZVBhc3N3b3JkID0gKCkgPT4gdmFsaWRhdG9yLmlzU3Ryb25nUGFzc3dvcmQocGFzc3dvcmQsIHsgbWluTGVuZ3RoOiA2IH0pXG5cbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgcnVsZUVtYWlsKCksXG4gICAgICBydWxlUGFzc3dvcmQoKSxcbiAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICByZXR1cm4gdmFsaWRhdGlvblJlc3VsdFxuICB9XG5cbiAgY29uc3QgbG9naW4gPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBsb2dpbmApXG4gICAgY29uc3QgeyBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpXG5cbiAgICByZXR1cm4gdXNlclxuICB9XG5cbiAgY29uc3Qgb25GYWlsdXJlTG9naW4gPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVMb2dpbmApXG4gICAgY29uc3QgeyBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfSA9IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UobWVzc2FnZSlcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH1cbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCB9ID0gYm9keVxuXG4gIC8vIOODquOCr+OCqOOCueODiOODnOODh+OCo+OBp+a4oeOBleOCjOOBn0pTT07jg4fjg7zjgr/jgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdCBib2R5JyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQoZW1haWwsIHBhc3N3b3JkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44Ot44Kw44Kk44Oz44KS6Kmm44G/44KLXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBsb2dpbihlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICh1c2VyLmVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOBqOODoeODg+OCu+ODvOOCuOOCkuWQq+OCgEpTT07jg4fjg7zjgr/jgpLov5TjgZlcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfSA9IG9uRmFpbHVyZUxvZ2luKHVzZXIuZXJyb3IpXG4gICAgcmVzXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZSxcbiAgICAgIHN0YXR1c01lc3NhZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgavmiJDlip/jgZfjgZ/jgonjgq/jg4Pjgq3jg7zjgpLkv53lrZjjgZnjgotcbiAgY29uc3QgZXhwaXJlcyA9IG5ldyBEYXRlKERhdGUubm93KCkgKyA2MCAqIDYwICogMTAwMClcbiAgcmVzLmNvb2tpZSgndG9rZW4nLCB1c2VyLmlkVG9rZW4sIHtcbiAgICBleHBpcmVzOiBleHBpcmVzLFxuICAgIC8vIGh0dHBPbmx5OiB0cnVlLFxuICAgIC8vIHNlY3VyZTogdHJ1ZSxcbiAgfSlcblxuICByZXNcbiAgLnNlbmQoe1xuICAgIHVpZDogdXNlci5sb2NhbElkLFxuICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICB9KVxufSlcblxuLyoqIERFTEVURSAvdXNlci9sb2dpbiAqL1xucm91dGVyLmRlbGV0ZSgnLycsIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBsb2dvdXRgKVxuICAgIHJlc1xuICAgIC5jbGVhckNvb2tpZSgndG9rZW4nKVxuICAgIC5zZW5kKHt9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlcy5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxuICAgICAgbWVzc2FnZTogJ1VuZXhwZWN0ZWQgZXJyb3InLFxuICAgIH0pXG4gIH1cbn0pXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSAnc3JjL3V0aWxzL2ZpcmViYXNlJ1xuaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbi8qKiBQT1NUIC9hcGkvdXNlcnMgKi9cbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhZGlzcGxheU5hbWUgfHwgIXRlbmFudElkKSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlcXVlc3QgYm9keScsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODkOODquODh+ODvOOCt+ODp+ODs+OCkuihjOOBhOOAgTHjgaTjgafjgoLkuI3lkIjmoLzjga7loLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkKGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8gRmlyZWJhc2Xjgbjjg6bjg7zjgrbnmbvpjLLjgZnjgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UodXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODh+ODvOOCv+ODmeODvOOCueOBuOODl+ODreODleOCo+ODvOODq+aDheWgseOCkueZu+mMsuOBmeOCi1xuICB0cnkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmxvY2FsSWQsIGVtYWlsLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gICAgcmVzLnNlbmQocHJvZmlsZSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolGaXJlYmFzZeOBi+OCieODh+ODvOOCv+OCkuWJiumZpOOBl+OBpkhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgpLov5TjgZlcbiAgICBhd2FpdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmlkVG9rZW4pXG4gICAgcmVzXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdDcmVhdGUgdG8gZGF0YWJhc2UgZmFpbGVkJyxcbiAgICB9KVxuICB9XG59KVxuXG5jb25zdCB2YWxpZCA9IChcbiAgZW1haWw6IGFueSxcbiAgcGFzc3dvcmQ6IGFueSxcbiAgZGlzcGxheU5hbWU6IGFueSxcbiAgdGVuYW50SWQ6IGFueSxcbikgPT4ge1xuICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgY29uc3QgcnVsZVBhc3N3b3JkID0gKCkgPT4gdmFsaWRhdG9yLmlzU3Ryb25nUGFzc3dvcmQocGFzc3dvcmQsIHsgbWluTGVuZ3RoOiA2IH0pXG4gIGNvbnN0IHJ1bGVEaXNwbGF5TmFtZSA9ICgpID0+IHtcbiAgICBjb25zdCBpc1NvbWVUZXh0ID0gW1xuICAgICAgdmFsaWRhdG9yLmlzQXNjaWkoZGlzcGxheU5hbWUpLFxuICAgICAgdmFsaWRhdG9yLmlzTXVsdGlieXRlKGRpc3BsYXlOYW1lKSxcbiAgICBdLnNvbWUocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIGNvbnN0IGlzVmFsaWQgPSBbXG4gICAgICBpc1NvbWVUZXh0LFxuICAgICAgdmFsaWRhdG9yLmlzTGVuZ3RoKGRpc3BsYXlOYW1lLCB7IG1pbjogMSwgbWF4OiAzMiB9KSxcbiAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICByZXR1cm4gaXNWYWxpZFxuICB9XG4gIGNvbnN0IHJ1bGVUZW5hbnRJZCA9ICgpID0+IHZhbGlkYXRvci5pc0ludCh0ZW5hbnRJZClcblxuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgIHJ1bGVFbWFpbCgpLFxuICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIHJ1bGVEaXNwbGF5TmFtZSgpLFxuICAgIHJ1bGVUZW5hbnRJZCgpLFxuICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbn1cblxuY29uc3QgY3JlYXRlVXNlclRvRmlyZWJhc2UgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICBjb25zdCB7IHNpZ25VcCB9ID0gdXNlRmlyZWJhc2UoKVxuICBjb25zdCB1c2VyID0gYXdhaXQgc2lnblVwKGVtYWlsLCBwYXNzd29yZClcbiAgcmV0dXJuIHVzZXJcbn1cblxuY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UgPSAoZXJyb3I6IGFueSkgPT4ge1xuICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH0gPSBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlKG1lc3NhZ2UpXG4gIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxufVxuXG5jb25zdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChcbiAgdWlkOiBzdHJpbmcsXG4gIGVtYWlsOiBzdHJpbmcsXG4gIGRpc3BsYXlOYW1lOiBzdHJpbmcsXG4gIHRlbmFudElkOiBzdHJpbmcsXG4gICkgPT4ge1xuICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICBjb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcbiAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IHByaXNtYS5wcm9maWxlLmNyZWF0ZSh7XG4gICAgZGF0YToge1xuICAgICAgdWlkLFxuICAgICAgZW1haWwsXG4gICAgICBkaXNwbGF5TmFtZSxcbiAgICAgIHRlbmFudElkOiBwYXJzZUludCh0ZW5hbnRJZCksXG4gICAgfVxuICB9KVxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvZmlsZSlcbn1cblxuY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoaWRUb2tlbjogc3RyaW5nKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gIGNvbnN0IHsgZGVsZXRlVXNlciB9ID0gdXNlRmlyZWJhc2UoKVxuICBhd2FpdCBkZWxldGVVc2VyKGlkVG9rZW4pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiZXhwb3J0IGNvbnN0IHVzZUZpcmViYXNlID0gKCkgPT4ge1xuICBjb25zdCBhcGlLZXkgPSAnQUl6YVN5RElyYUhrdUZXWWRJdFdFeWRjZTFkYmFBd0JzUk5OTWVBJ1xuICBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxYFxuXG4gIGNvbnN0IHNpZ25VcCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnblVwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlVXNlciA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpkZWxldGVgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBpZFRva2VuXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnbkluV2l0aFBhc3N3b3JkYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgdmVyaWZ5ID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmxvb2t1cGBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGlkVG9rZW4sXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHN0YXR1c0NvZGVcbiAgICBsZXQgc3RhdHVzTWVzc2FnZVxuXG4gICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICBjYXNlICdJTlZBTElEX1BBU1NXT1JEJzpcbiAgICAgIGNhc2UgJ0VNQUlMX05PVF9GT1VORCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDFcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdVbmF1dGhvcml6ZWQnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ09QRVJBVElPTl9OT1RfQUxMT1dFRCc6XG4gICAgICBjYXNlICdVU0VSX0RJU0FCTEVEJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwM1xuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ZvcmJpZGRlbidcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnRU1BSUxfRVhJU1RTJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0NvbmZsaWN0J1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdUT09fTUFOWV9BVFRFTVBUU19UUllfTEFURVInOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDI5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVG9vIE1hbnkgUmVxdWVzdHMnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA1MDBcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzaWduVXAsXG4gICAgZGVsZXRlVXNlcixcbiAgICBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCxcbiAgICB2ZXJpZnksXG4gICAgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSxcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZhbGlkYXRvclwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9