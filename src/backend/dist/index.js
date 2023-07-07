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
const paginate_1 = __webpack_require__(/*! src/utils/paginate */ "./src/utils/paginate.ts");
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
    const valid = (page, perPage) => {
        const rulePage = () => {
            return [
                validator_1.default.isInt(page),
                validator_1.default.isLength(page, { min: 1 })
            ].every(result => result === true);
        };
        const rulePerPage = () => {
            return [
                validator_1.default.isInt(perPage),
                validator_1.default.isLength(perPage, { min: 1, max: 100 })
            ].every(result => result === true);
        };
        const validationResult = [
            rulePage(),
            rulePerPage(),
        ].every(result => result === true);
        return validationResult;
    };
    const page = req.query.page?.toString();
    const perPage = req.query.perPage?.toString();
    if (!page || !perPage) {
        res.status(400).send({ statusMessage: 'Bad Request', message: 'No specified query' });
        return;
    }
    const validationResult = valid(page, perPage);
    if (!validationResult) {
        res
            .status(400)
            .send({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Validation failed',
        });
    }
    const users = await (0, paginate_1.paginate)({
        page: parseInt(page),
        perPage: parseInt(perPage),
        queryFn: (args) => prisma.profile.findMany({ ...args }),
        countFn: () => prisma.profile.count()
    });
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

/***/ "./src/utils/paginate.ts":
/*!*******************************!*\
  !*** ./src/utils/paginate.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.paginate = void 0;
async function paginate({ page, perPage, countFn, queryFn, }) {
    const [items, count] = await Promise.all([
        queryFn({
            skip: perPage * (page - 1),
            take: perPage,
        }),
        countFn(),
    ]);
    return {
        items,
        count,
        pageCount: Math.ceil(count / perPage),
    };
}
exports.paginate = paginate;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFLE9BQU87U0FDZCxDQUFDO1FBQ0YsT0FBTyxFQUFFO0tBQ1YsQ0FBQztJQUVGLE9BQU87UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7S0FDdEM7QUFDSCxDQUFDO0FBbkJELDRCQW1CQzs7Ozs7Ozs7Ozs7QUN2Q0Q7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9hcHAudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvbWlkZGxld2FyZS92ZXJpZnkudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL2xvZ2luLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3JvdXRlcy91c2Vycy50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy91dGlscy9maXJlYmFzZS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy91dGlscy9wYWdpbmF0ZS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcIkBwcmlzbWEvY2xpZW50XCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJjb3JzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJleHByZXNzXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJ2YWxpZGF0b3JcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnXG5cbmltcG9ydCB1c2VyUm91dGVyIGZyb20gJy4vcm91dGVzL3VzZXJzJ1xuaW1wb3J0IGxvZ2luUm91dGVyIGZyb20gJy4vcm91dGVzL2xvZ2luJ1xuXG5jb25zdCBhcHAgPSBleHByZXNzKClcbmFwcC51c2UoY29ycygpKVxuYXBwLnVzZShleHByZXNzLmpzb24oKSlcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpXG5cbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoJy9hcGkvdXNlcnMnLCB1c2VyUm91dGVyKVxuYXBwLnVzZSgnL2FwaS9sb2dpbicsIGxvZ2luUm91dGVyKVxuXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYExpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vYClcbn0pXG4iLCJpbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcydcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSBcInNyYy91dGlscy9maXJlYmFzZVwiXG5cbmV4cG9ydCBjb25zdCB2ZXJpZnkgPSBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgY29uc3QgeyBjaGVja0lkVG9rZW4gfSA9IHVzZUZpcmViYXNlKClcbiAgY29uc3QgdXNlciA9IGF3YWl0IGNoZWNrSWRUb2tlbihyZXEpXG5cbiAgaWYgKCF1c2VyLmVycm9yKSB7XG4gICAgcmV0dXJuIG5leHQoKVxuICB9XG5cbiAgcmVzLnNlbmQoe1xuICAgIHN0YXR1c0NvZGU6IHVzZXIuZXJyb3IuY29kZSxcbiAgICBzdGF0dXNNZXNzYWdlOiAnVW5hdXRob3JpemVkJyxcbiAgICBtZXNzYWdlOiB1c2VyLmVycm9yLm1lc3NhZ2UsXG4gIH0pXG59XG4iLCJpbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICd2YWxpZGF0b3InXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmltcG9ydCB7IHZlcmlmeSB9IGZyb20gJy4uL21pZGRsZXdhcmUvdmVyaWZ5J1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbi8qKiBQT1NUIC91c2VyL2xvZ2luICovXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB2YWxpZCA9IChcbiAgICBlbWFpbDogYW55LFxuICAgIHBhc3N3b3JkOiBhbnksXG4gICkgPT4ge1xuICAgIGNvbnN0IHJ1bGVFbWFpbCA9ICgpID0+IHZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKVxuICAgIGNvbnN0IHJ1bGVQYXNzd29yZCA9ICgpID0+IHZhbGlkYXRvci5pc1N0cm9uZ1Bhc3N3b3JkKHBhc3N3b3JkLCB7IG1pbkxlbmd0aDogNiB9KVxuXG4gICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IFtcbiAgICAgIHJ1bGVFbWFpbCgpLFxuICAgICAgcnVsZVBhc3N3b3JkKCksXG4gICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbiAgfVxuXG4gIGNvbnN0IGxvZ2luID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgbG9naW5gKVxuICAgIGNvbnN0IHsgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKVxuXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IG9uRmFpbHVyZUxvZ2luID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgb25GYWlsdXJlTG9naW5gKVxuICAgIGNvbnN0IHsgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH0gPSBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9XG4gIH1cblxuICBjb25zdCBib2R5ID0gcmVxLmJvZHlcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQgfSA9IGJvZHlcblxuICAvLyDjg6rjgq/jgqjjgrnjg4jjg5zjg4fjgqPjgafmuKHjgZXjgozjgZ9KU09O44OH44O844K/44GM5LiN5q2j44Gq5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlcXVlc3QgYm9keScsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODkOODquODh+ODvOOCt+ODp+ODs+OCkuihjOOBhOOAgTHjgaTjgafjgoLkuI3lkIjmoLzjga7loLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OCkuippuOBv+OCi1xuICBjb25zdCB1c2VyID0gYXdhaXQgbG9naW4oZW1haWwsIHBhc3N3b3JkKVxuICBpZiAodXNlci5lcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgajjg6Hjg4Pjgrvjg7zjgrjjgpLlkKvjgoBKU09O44OH44O844K/44KS6L+U44GZXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH0gPSBvbkZhaWx1cmVMb2dpbih1c2VyLmVycm9yKVxuICAgIHJlc1xuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGUsXG4gICAgICBzdGF0dXNNZXNzYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICB9XG5cbiAgLy8g44Ot44Kw44Kk44Oz44Gr5oiQ5Yqf44GX44Gf44KJ44Kv44OD44Kt44O844KS5L+d5a2Y44GZ44KLXG4gIGNvbnN0IHRpbWUgPSA2MCAqIDYwICogMTAwMFxuICBjb25zdCBleHBpcmVzID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIHRpbWUpXG5cbiAgcmVzLmNvb2tpZSgndG9rZW4nLCB1c2VyLmlkVG9rZW4sIHtcbiAgICBleHBpcmVzOiBleHBpcmVzLFxuICAgIC8vIGh0dHBPbmx5OiB0cnVlLFxuICAgIC8vIHNlY3VyZTogdHJ1ZSxcbiAgfSlcblxuICByZXNcbiAgLnNlbmQoe1xuICAgIHVpZDogdXNlci5sb2NhbElkLFxuICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICB9KVxufSlcblxuLyoqIERFTEVURSAvdXNlci9sb2dpbiAqL1xucm91dGVyLmRlbGV0ZSgnLycsIHZlcmlmeSwgYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuICB0cnkge1xuICAgIHJlc1xuICAgIC5jbGVhckNvb2tpZSgndG9rZW4nKVxuICAgIC5zZW5kKHt9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlcy5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxuICAgICAgbWVzc2FnZTogJ1VuZXhwZWN0ZWQgZXJyb3InLFxuICAgIH0pXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tICdzcmMvdXRpbHMvZmlyZWJhc2UnXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcbmltcG9ydCB7IHZlcmlmeSB9IGZyb20gJy4uL21pZGRsZXdhcmUvdmVyaWZ5J1xuaW1wb3J0IHsgcGFnaW5hdGUgfSBmcm9tICdzcmMvdXRpbHMvcGFnaW5hdGUnXG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcbmNvbnN0IHByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKVxuXG4vKiogUE9TVCAvYXBpL3VzZXJzICovXG5yb3V0ZXIucG9zdCgnLycsIHZlcmlmeSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHZhbGlkID0gKFxuICAgIGVtYWlsOiBhbnksXG4gICAgcGFzc3dvcmQ6IGFueSxcbiAgICBkaXNwbGF5TmFtZTogYW55LFxuICAgIHRlbmFudElkOiBhbnksXG4gICkgPT4ge1xuICAgIGNvbnN0IHJ1bGVFbWFpbCA9ICgpID0+IHZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKVxuICAgIGNvbnN0IHJ1bGVQYXNzd29yZCA9ICgpID0+IHZhbGlkYXRvci5pc1N0cm9uZ1Bhc3N3b3JkKHBhc3N3b3JkLCB7IG1pbkxlbmd0aDogNiB9KVxuICAgIGNvbnN0IHJ1bGVEaXNwbGF5TmFtZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGlzU29tZVRleHQgPSBbXG4gICAgICAgIHZhbGlkYXRvci5pc0FzY2lpKGRpc3BsYXlOYW1lKSxcbiAgICAgICAgdmFsaWRhdG9yLmlzTXVsdGlieXRlKGRpc3BsYXlOYW1lKSxcbiAgICAgIF0uc29tZShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgICBjb25zdCBpc1ZhbGlkID0gW1xuICAgICAgICBpc1NvbWVUZXh0LFxuICAgICAgICB2YWxpZGF0b3IuaXNMZW5ndGgoZGlzcGxheU5hbWUsIHsgbWluOiAxLCBtYXg6IDMyIH0pLFxuICAgICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgICByZXR1cm4gaXNWYWxpZFxuICAgIH1cbiAgICBjb25zdCBydWxlVGVuYW50SWQgPSAoKSA9PiB2YWxpZGF0b3IuaXNJbnQodGVuYW50SWQpXG5cbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgcnVsZUVtYWlsKCksXG4gICAgICBydWxlUGFzc3dvcmQoKSxcbiAgICAgIHJ1bGVEaXNwbGF5TmFtZSgpLFxuICAgICAgcnVsZVRlbmFudElkKCksXG4gICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICAgIGNvbnN0IHsgc2lnblVwIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25VcChlbWFpbCwgcGFzc3dvcmQpXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICAgIGNvbnN0IHsgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH0gPSBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9XG4gIH1cblxuICBjb25zdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChcbiAgICB1aWQ6IHN0cmluZyxcbiAgICBlbWFpbDogc3RyaW5nLFxuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmcsXG4gICAgdGVuYW50SWQ6IHN0cmluZyxcbiAgICApID0+IHtcbiAgICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBwcmlzbWEucHJvZmlsZS5jcmVhdGUoe1xuICAgICAgZGF0YToge1xuICAgICAgICB1aWQsXG4gICAgICAgIGVtYWlsLFxuICAgICAgICBkaXNwbGF5TmFtZSxcbiAgICAgICAgdGVuYW50SWQ6IHBhcnNlSW50KHRlbmFudElkKSxcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcm9maWxlKVxuICB9XG5cbiAgY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoaWRUb2tlbjogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlYClcbiAgICBjb25zdCB7IGRlbGV0ZVVzZXIgfSA9IHVzZUZpcmViYXNlKClcbiAgICBhd2FpdCBkZWxldGVVc2VyKGlkVG9rZW4pXG4gIH1cblxuICBjb25zdCBib2R5ID0gcmVxLmJvZHlcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZCB9ID0gYm9keVxuXG4gIC8vIOODquOCr+OCqOOCueODiOODnOODh+OCo+OBp+a4oeOBleOCjOOBn0pTT07jg4fjg7zjgr/jgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIWRpc3BsYXlOYW1lIHx8ICF0ZW5hbnRJZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZClcbiAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZpcmViYXNl44G444Om44O844K255m76Yyy44GZ44KLXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjcmVhdGVVc2VyVG9GaXJlYmFzZShlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICh1c2VyLmVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOBqOODoeODg+OCu+ODvOOCuOOCkuWQq+OCgEpTT07jg4fjg7zjgr/jgpLov5TjgZlcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfSA9IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlKHVzZXIuZXJyb3IpXG4gICAgcmVzXG4gICAgLnN0YXR1cyhzdGF0dXNDb2RlKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGUsXG4gICAgICBzdGF0dXNNZXNzYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OH44O844K/44OZ44O844K544G444OX44Ot44OV44Kj44O844Or5oOF5aCx44KS55m76Yyy44GZ44KLXG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGNyZWF0ZVVzZXJUb0RhdGFiYXNlKHVzZXIubG9jYWxJZCwgZW1haWwsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZClcbiAgICByZXMuc2VuZChwcm9maWxlKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUZpcmViYXNl44GL44KJ44OH44O844K/44KS5YmK6Zmk44GX44GmSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOCkui/lOOBmVxuICAgIGF3YWl0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlKHVzZXIuaWRUb2tlbilcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0NyZWF0ZSB0byBkYXRhYmFzZSBmYWlsZWQnLFxuICAgIH0pXG4gIH1cbn0pXG5cbi8qKiBHRVQgL2FwaS91c2VycyAqL1xuLy8gcm91dGVyLmdldCgnLycsIHZlcmlmeSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG5yb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHZhbGlkID0gKFxuICAgIHBhZ2U6IHN0cmluZyxcbiAgICBwZXJQYWdlOiBzdHJpbmcsXG4gICkgPT4ge1xuICAgIGNvbnN0IHJ1bGVQYWdlID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgdmFsaWRhdG9yLmlzSW50KHBhZ2UpLFxuICAgICAgICB2YWxpZGF0b3IuaXNMZW5ndGgocGFnZSwgeyBtaW46IDEgfSlcbiAgICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcbiAgICB9XG4gICAgY29uc3QgcnVsZVBlclBhZ2UgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB2YWxpZGF0b3IuaXNJbnQocGVyUGFnZSksXG4gICAgICAgIHZhbGlkYXRvci5pc0xlbmd0aChwZXJQYWdlLCB7IG1pbjogMSwgbWF4OiAxMDAgfSlcbiAgICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcbiAgICB9XG5cbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgcnVsZVBhZ2UoKSxcbiAgICAgIHJ1bGVQZXJQYWdlKCksXG4gICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbiAgfVxuXG4gIGNvbnN0IHBhZ2UgPSByZXEucXVlcnkucGFnZT8udG9TdHJpbmcoKVxuICBjb25zdCBwZXJQYWdlID0gcmVxLnF1ZXJ5LnBlclBhZ2U/LnRvU3RyaW5nKClcblxuICAvLyDjgq/jgqjjg6rjgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFwYWdlIHx8ICFwZXJQYWdlKSB7XG4gICAgcmVzLnN0YXR1cyg0MDApLnNlbmQoeyBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLCBtZXNzYWdlOiAnTm8gc3BlY2lmaWVkIHF1ZXJ5JyB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQocGFnZSwgcGVyUGFnZSlcbiAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHVzZXJzID0gYXdhaXQgcGFnaW5hdGUoe1xuICAgIHBhZ2U6IHBhcnNlSW50KHBhZ2UpLFxuICAgIHBlclBhZ2U6IHBhcnNlSW50KHBlclBhZ2UpLFxuICAgIHF1ZXJ5Rm46IChhcmdzKSA9PlxuICAgICAgcHJpc21hLnByb2ZpbGUuZmluZE1hbnkoeyAuLi5hcmdzIH0pLFxuICAgIGNvdW50Rm46ICgpID0+IHByaXNtYS5wcm9maWxlLmNvdW50KClcbiAgfSlcblxuICByZXNcbiAgLnN0YXR1cygyMDApXG4gIC5zZW5kKHVzZXJzKVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgeyBSZXF1ZXN0IH0gZnJvbSAnZXhwcmVzcydcblxuZXhwb3J0IGNvbnN0IHVzZUZpcmViYXNlID0gKCkgPT4ge1xuICBjb25zdCBhcGlLZXkgPSAnQUl6YVN5RElyYUhrdUZXWWRJdFdFeWRjZTFkYmFBd0JzUk5OTWVBJ1xuICBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxYFxuXG4gIGNvbnN0IHNpZ25VcCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnblVwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlVXNlciA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpkZWxldGVgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBpZFRva2VuXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnbkluV2l0aFBhc3N3b3JkYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgY2hlY2tJZFRva2VuID0gYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmxvb2t1cGBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgaWRUb2tlbiA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb25cbiAgICBjb25zdCBib2R5ID0geyBpZFRva2VuIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgIGxldCBzdGF0dXNDb2RlXG4gICAgbGV0IHN0YXR1c01lc3NhZ2VcblxuICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgY2FzZSAnSU5WQUxJRF9QQVNTV09SRCc6XG4gICAgICBjYXNlICdFTUFJTF9OT1RfRk9VTkQnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDAxXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVW5hdXRob3JpemVkJ1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdPUEVSQVRJT05fTk9UX0FMTE9XRUQnOlxuICAgICAgY2FzZSAnVVNFUl9ESVNBQkxFRCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDNcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdGb3JiaWRkZW4nXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0VNQUlMX0VYSVNUUyc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDlcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdDb25mbGljdCdcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnVE9PX01BTllfQVRURU1QVFNfVFJZX0xBVEVSJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQyOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ1RvbyBNYW55IFJlcXVlc3RzJ1xuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdGF0dXNDb2RlID0gNTAwXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnSW50ZXJuYWwgU2VydmVyIEVycm9yJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2lnblVwLFxuICAgIGRlbGV0ZVVzZXIsXG4gICAgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQsXG4gICAgY2hlY2tJZFRva2VuLFxuICAgIGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UsXG4gIH1cbn1cbiIsIi8qKlxuICogUHJpc21h44Gn44Oa44O844K444ON44O844K344On44Oz44KS5a6f6KOF44GZ44KL77yIQ2xpZW50IGV4dGVuc2lvbnPjgoLkvb/jgaPjgabjgb/jgovvvIlcbiAqIGh0dHBzOi8vemVubi5kZXYvZ2liamFwYW4vYXJ0aWNsZXMvODE1YzBhNjc4M2Q1ZmZcbiAqL1xudHlwZSBQYWdpbmF0ZUlucHV0czxJdGVtcz4gPSB7XG4gIHBhZ2U6IG51bWJlclxuICBwZXJQYWdlOiBudW1iZXJcbiAgcXVlcnlGbjogKGFyZ3M6IHsgc2tpcDogbnVtYmVyOyB0YWtlOiBudW1iZXIgfSkgPT4gUHJvbWlzZTxJdGVtcz5cbiAgY291bnRGbjogKCkgPT4gUHJvbWlzZTxudW1iZXI+XG59XG5cbnR5cGUgUGFnaW5hdGVPdXRwdXRzPEl0ZW1zPiA9IHtcbiAgaXRlbXM6IEl0ZW1zXG4gIGNvdW50OiBudW1iZXJcbiAgcGFnZUNvdW50OiBudW1iZXJcbn1cblxuLyoqXG4gKiDjg5rjg7zjgrjjg43jg7zjgrfjg6fjg7PjgZXjgozjgZ/jg4fjg7zjgr/jgpLlj5blvpfjgZnjgotcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBhZ2luYXRlPEl0ZW1zPih7XG4gIHBhZ2UsXG4gIHBlclBhZ2UsXG4gIGNvdW50Rm4sXG4gIHF1ZXJ5Rm4sXG59OiBQYWdpbmF0ZUlucHV0czxJdGVtcz4pOiBQcm9taXNlPFBhZ2luYXRlT3V0cHV0czxJdGVtcz4+IHtcbiAgY29uc3QgW2l0ZW1zLCBjb3VudF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgcXVlcnlGbih7XG4gICAgICBza2lwOiBwZXJQYWdlICogKHBhZ2UgLSAxKSxcbiAgICAgIHRha2U6IHBlclBhZ2UsXG4gICAgfSksXG4gICAgY291bnRGbigpLFxuICBdKVxuXG4gIHJldHVybiB7XG4gICAgaXRlbXMsXG4gICAgY291bnQsXG4gICAgcGFnZUNvdW50OiBNYXRoLmNlaWwoY291bnQgLyBwZXJQYWdlKSxcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZhbGlkYXRvclwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9