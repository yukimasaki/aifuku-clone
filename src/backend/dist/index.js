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
const zod_1 = __webpack_require__(/*! zod */ "zod");
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
    const { page, perPage } = req.query;
    const rulePage = zod_1.z.coerce.number().int().min(1);
    const rulePerPage = zod_1.z.coerce.number().int().min(1).max(100);
    if (rulePage.safeParse(page).success === false ||
        rulePerPage.safeParse(perPage).success === false) {
        res.status(422)
            .send({
            statusCode: 422,
            statusMessage: 'Unprocessable Entity',
            message: 'Validation failed',
        });
        return;
    }
    const users = await (0, paginate_1.paginate)(req, {
        page: rulePage.parse(page),
        perPage: rulePerPage.parse(perPage),
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
exports.addNavigateBtn = exports.createPageLabels = exports.paginate = void 0;
const paginate = async (req, { page, perPage, countFn, queryFn, }) => {
    const [items, count] = await Promise.all([
        queryFn({
            skip: perPage * (page - 1),
            take: perPage,
        }),
        countFn(),
    ]);
    const baseUrl = req.baseUrl;
    const pageCount = Math.ceil(count / perPage);
    const pageRange = 2;
    const firstPage = 1;
    const links = {
        first: `${baseUrl}/?page=1&perPage=${perPage}`,
        prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&perPage=${perPage}`,
        next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&perPage=${perPage}`,
        last: `${baseUrl}/?page=${pageCount}&perPage=${perPage}`,
    };
    const metaLinks = (0, exports.createPageLabels)(page, pageCount, pageRange, baseUrl, perPage);
    return {
        items,
        count,
        pageCount,
        links,
        meta: { links: metaLinks },
    };
};
exports.paginate = paginate;
const createPageLabels = (page, pageCount, pageRange, baseUrl, perPage) => {
    const firstPage = 1;
    const lastPage = pageCount;
    const duplicatedValues = [];
    if (pageCount <= 4) {
        Array.from({ length: pageCount }, (_, index) => {
            const currentPage = index + 1;
            duplicatedValues.push({ dupeCheckLabel: currentPage, value: currentPage });
        });
    }
    else if (page === firstPage) {
        Array.from({ length: 3 }, (_, index) => {
            const currentPage = index + 1;
            duplicatedValues.push({
                dupeCheckLabel: currentPage,
                value: currentPage,
                url: `${baseUrl}/?page=${currentPage}&perPage=${perPage}`,
                active: page === currentPage,
            });
        });
        duplicatedValues.push({ dupeCheckLabel: 'leftDot', value: '...', url: '', active: false }, { dupeCheckLabel: lastPage, value: lastPage, url: `${baseUrl}/?page=${lastPage}&perPage=${perPage}`, active: false }, { dupeCheckLabel: 'Next', value: 'Next', url: `${baseUrl}/?page=${page + 1}&perPage=${perPage}`, active: false });
    }
    else if (page === lastPage) {
        duplicatedValues.push({ dupeCheckLabel: firstPage, value: firstPage }, { dupeCheckLabel: 'rightDot', value: '...' });
        Array.from({ length: 3 }, (_, index) => {
            const currentPage = index + page - pageRange;
            duplicatedValues.push({ dupeCheckLabel: currentPage, value: currentPage });
        });
    }
    else {
        const isContinuous = ((page, pageCount, pageRange) => {
            const result = [];
            Array.from({ length: 2 }, (_, index) => {
                if (index === 0) {
                    result.push(page - pageRange - 1 <= 1);
                }
                else {
                    result.push(pageCount - page <= pageRange + 1);
                }
            });
            return result;
        })(page, pageCount, pageRange);
        isContinuous.forEach((isContinuous, index) => {
            if (index === 0) {
                const leftPageLabels = [];
                if (isContinuous) {
                    Array.from({ length: page }, (_, index) => {
                        const currentPage = index + 1;
                        leftPageLabels.push({ dupeCheckLabel: currentPage, value: currentPage });
                    });
                }
                else {
                    leftPageLabels.push({ dupeCheckLabel: firstPage, value: firstPage });
                    leftPageLabels.push({ dupeCheckLabel: 'leftDot', value: '...' });
                    Array.from({ length: 3 }, (_, index) => {
                        const currentPage = index + page - pageRange;
                        leftPageLabels.push({ dupeCheckLabel: currentPage, value: currentPage });
                    });
                }
                leftPageLabels.forEach(v => duplicatedValues.push(v));
            }
            else {
                const rightPageLabels = [];
                if (isContinuous) {
                    Array.from({ length: pageCount - page + 1 }, (_, index) => {
                        const currentPage = index + page;
                        rightPageLabels.push({ dupeCheckLabel: currentPage, value: currentPage });
                    });
                }
                else {
                    Array.from({ length: 3 }, (_, index) => {
                        const currentPage = index + page;
                        rightPageLabels.push({ dupeCheckLabel: currentPage, value: currentPage });
                    });
                    rightPageLabels.push({ dupeCheckLabel: 'rightDot', value: '...' });
                    rightPageLabels.push({ dupeCheckLabel: pageCount, value: pageCount });
                }
                rightPageLabels.forEach(v => duplicatedValues.push(v));
            }
        });
    }
    const uniqueValues = duplicatedValues.filter((element, index, self) => self.findIndex(e => e.dupeCheckLabel === element.dupeCheckLabel) === index);
    const pageLabels = uniqueValues.map(element => {
        return {
            id: (uniqueValues.indexOf(element) + 1).toString(),
            label: element.value.toString(),
            url: element.url?.toString(),
            active: element.active?.toString()
        };
    });
    return pageLabels;
};
exports.createPageLabels = createPageLabels;
const addNavigateBtn = (pageLabels, page) => {
};
exports.addNavigateBtn = addNavigateBtn;


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

/***/ }),

/***/ "zod":
/*!**********************!*\
  !*** external "zod" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("zod");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9taWRkbGV3YXJlL3ZlcmlmeS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL3VzZXJzLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL2ZpcmViYXNlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL3BhZ2luYXRlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQHByaXNtYS9jbGllbnRcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImNvcnNcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcInZhbGlkYXRvclwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiem9kXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuXG5pbXBvcnQgdXNlclJvdXRlciBmcm9tICcuL3JvdXRlcy91c2VycydcbmltcG9ydCBsb2dpblJvdXRlciBmcm9tICcuL3JvdXRlcy9sb2dpbidcblxuY29uc3QgYXBwID0gZXhwcmVzcygpXG5hcHAudXNlKGNvcnMoKSlcbmFwcC51c2UoZXhwcmVzcy5qc29uKCkpXG5hcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKVxuXG5jb25zdCBwb3J0ID0gMzAwMFxuXG5hcHAudXNlKCcvYXBpL3VzZXJzJywgdXNlclJvdXRlcilcbmFwcC51c2UoJy9hcGkvbG9naW4nLCBsb2dpblJvdXRlcilcblxuYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApXG59KVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gXCJzcmMvdXRpbHMvZmlyZWJhc2VcIlxuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgY2hlY2tJZFRva2VuIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjaGVja0lkVG9rZW4ocmVxKVxuXG4gIGlmICghdXNlci5lcnJvcikge1xuICAgIHJldHVybiBuZXh0KClcbiAgfVxuXG4gIHJlcy5zZW5kKHtcbiAgICBzdGF0dXNDb2RlOiB1c2VyLmVycm9yLmNvZGUsXG4gICAgc3RhdHVzTWVzc2FnZTogJ1VuYXV0aG9yaXplZCcsXG4gICAgbWVzc2FnZTogdXNlci5lcnJvci5tZXNzYWdlLFxuICB9KVxufVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tICdzcmMvdXRpbHMvZmlyZWJhc2UnXG5pbXBvcnQgeyB2ZXJpZnkgfSBmcm9tICcuLi9taWRkbGV3YXJlL3ZlcmlmeSdcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vKiogUE9TVCAvdXNlci9sb2dpbiAqL1xucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGxvZ2luYClcbiAgICBjb25zdCB7IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZClcblxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVMb2dpbiA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUxvZ2luYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgpLoqabjgb/jgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlTG9naW4odXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OBq+aIkOWKn+OBl+OBn+OCieOCr+ODg+OCreODvOOCkuS/neWtmOOBmeOCi1xuICBjb25zdCB0aW1lID0gNjAgKiA2MCAqIDEwMDBcbiAgY29uc3QgZXhwaXJlcyA9IG5ldyBEYXRlKERhdGUubm93KCkgKyB0aW1lKVxuXG4gIHJlcy5jb29raWUoJ3Rva2VuJywgdXNlci5pZFRva2VuLCB7XG4gICAgZXhwaXJlczogZXhwaXJlcyxcbiAgICAvLyBodHRwT25seTogdHJ1ZSxcbiAgICAvLyBzZWN1cmU6IHRydWUsXG4gIH0pXG5cbiAgcmVzXG4gIC5zZW5kKHtcbiAgICB1aWQ6IHVzZXIubG9jYWxJZCxcbiAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgfSlcbn0pXG5cbi8qKiBERUxFVEUgL3VzZXIvbG9naW4gKi9cbnJvdXRlci5kZWxldGUoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcbiAgdHJ5IHtcbiAgICByZXNcbiAgICAuY2xlYXJDb29raWUoJ3Rva2VuJylcbiAgICAuc2VuZCh7fSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXMuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcbiAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGVycm9yJyxcbiAgICB9KVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnIC8v44Gf44KB44GX44Gr5L2/44Gj44Gm44G/44KLXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSAnLi4vbWlkZGxld2FyZS92ZXJpZnknXG4vLyBpbXBvcnQgeyBwYWdpbmF0ZSB9IGZyb20gJ3NyYy91dGlscy9wYWdpbmF0ZSdcbmltcG9ydCB7IHBhZ2luYXRlIH0gZnJvbSAnc3JjL3V0aWxzL3BhZ2luYXRlJ1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcblxuLyoqIFBPU1QgL2FwaS91c2VycyAqL1xucm91dGVyLnBvc3QoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB2YWxpZCA9IChcbiAgICBlbWFpbDogYW55LFxuICAgIHBhc3N3b3JkOiBhbnksXG4gICAgZGlzcGxheU5hbWU6IGFueSxcbiAgICB0ZW5hbnRJZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcbiAgICBjb25zdCBydWxlRGlzcGxheU5hbWUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpc1NvbWVUZXh0ID0gW1xuICAgICAgICB2YWxpZGF0b3IuaXNBc2NpaShkaXNwbGF5TmFtZSksXG4gICAgICAgIHZhbGlkYXRvci5pc011bHRpYnl0ZShkaXNwbGF5TmFtZSksXG4gICAgICBdLnNvbWUocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgICAgY29uc3QgaXNWYWxpZCA9IFtcbiAgICAgICAgaXNTb21lVGV4dCxcbiAgICAgICAgdmFsaWRhdG9yLmlzTGVuZ3RoKGRpc3BsYXlOYW1lLCB7IG1pbjogMSwgbWF4OiAzMiB9KSxcbiAgICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgICAgcmV0dXJuIGlzVmFsaWRcbiAgICB9XG4gICAgY29uc3QgcnVsZVRlbmFudElkID0gKCkgPT4gdmFsaWRhdG9yLmlzSW50KHRlbmFudElkKVxuXG4gICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IFtcbiAgICAgIHJ1bGVFbWFpbCgpLFxuICAgICAgcnVsZVBhc3N3b3JkKCksXG4gICAgICBydWxlRGlzcGxheU5hbWUoKSxcbiAgICAgIHJ1bGVUZW5hbnRJZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBjcmVhdGVVc2VyVG9GaXJlYmFzZSA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGNyZWF0ZVVzZXJUb0ZpcmViYXNlYClcbiAgICBjb25zdCB7IHNpZ25VcCB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBzaWduVXAoZW1haWwsIHBhc3N3b3JkKVxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZSA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgY3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoXG4gICAgdWlkOiBzdHJpbmcsXG4gICAgZW1haWw6IHN0cmluZyxcbiAgICBkaXNwbGF5TmFtZTogc3RyaW5nLFxuICAgIHRlbmFudElkOiBzdHJpbmcsXG4gICAgKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGNyZWF0ZVVzZXJUb0RhdGFiYXNlYClcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgcHJpc21hLnByb2ZpbGUuY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdWlkLFxuICAgICAgICBlbWFpbCxcbiAgICAgICAgZGlzcGxheU5hbWUsXG4gICAgICAgIHRlbmFudElkOiBwYXJzZUludCh0ZW5hbnRJZCksXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvZmlsZSlcbiAgfVxuXG4gIGNvbnN0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gICAgY29uc3QgeyBkZWxldGVVc2VyIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgYXdhaXQgZGVsZXRlVXNlcihpZFRva2VuKVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQgfSA9IGJvZHlcblxuICAvLyDjg6rjgq/jgqjjgrnjg4jjg5zjg4fjgqPjgafmuKHjgZXjgozjgZ9KU09O44OH44O844K/44GM5LiN5q2j44Gq5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGlmICghZW1haWwgfHwgIXBhc3N3b3JkIHx8ICFkaXNwbGF5TmFtZSB8fCAhdGVuYW50SWQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdCBib2R5JyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQoZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyBGaXJlYmFzZeOBuOODpuODvOOCtueZu+mMsuOBmeOCi1xuICBjb25zdCB1c2VyID0gYXdhaXQgY3JlYXRlVXNlclRvRmlyZWJhc2UoZW1haWwsIHBhc3N3b3JkKVxuICBpZiAodXNlci5lcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgajjg6Hjg4Pjgrvjg7zjgrjjgpLlkKvjgoBKU09O44OH44O844K/44KS6L+U44GZXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH0gPSBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZSh1c2VyLmVycm9yKVxuICAgIHJlc1xuICAgIC5zdGF0dXMoc3RhdHVzQ29kZSlcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODh+ODvOOCv+ODmeODvOOCueOBuOODl+ODreODleOCo+ODvOODq+aDheWgseOCkueZu+mMsuOBmeOCi1xuICB0cnkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmxvY2FsSWQsIGVtYWlsLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gICAgcmVzLnNlbmQocHJvZmlsZSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolGaXJlYmFzZeOBi+OCieODh+ODvOOCv+OCkuWJiumZpOOBl+OBpkhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgpLov5TjgZlcbiAgICBhd2FpdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmlkVG9rZW4pXG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdDcmVhdGUgdG8gZGF0YWJhc2UgZmFpbGVkJyxcbiAgICB9KVxuICB9XG59KVxuXG4vKiogR0VUIC9hcGkvdXNlcnMgKi9cbi8vIHJvdXRlci5nZXQoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xucm91dGVyLmdldCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHBhZ2UsIHBlclBhZ2UgfSA9IHJlcS5xdWVyeVxuXG4gIGNvbnN0IHJ1bGVQYWdlID0gei5jb2VyY2UubnVtYmVyKCkuaW50KCkubWluKDEpXG4gIGNvbnN0IHJ1bGVQZXJQYWdlID0gei5jb2VyY2UubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCgxMDApXG5cbiAgaWYgKFxuICAgIHJ1bGVQYWdlLnNhZmVQYXJzZShwYWdlKS5zdWNjZXNzID09PSBmYWxzZSB8fFxuICAgIHJ1bGVQZXJQYWdlLnNhZmVQYXJzZShwZXJQYWdlKS5zdWNjZXNzID09PSBmYWxzZVxuICApIHtcbiAgICByZXMuc3RhdHVzKDQyMilcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MjIsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnVW5wcm9jZXNzYWJsZSBFbnRpdHknLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgdXNlcnMgPSBhd2FpdCBwYWdpbmF0ZShyZXEse1xuICAgIHBhZ2U6IHJ1bGVQYWdlLnBhcnNlKHBhZ2UpLFxuICAgIHBlclBhZ2U6IHJ1bGVQZXJQYWdlLnBhcnNlKHBlclBhZ2UpLFxuICAgIHF1ZXJ5Rm46IChhcmdzKSA9PlxuICAgICAgcHJpc21hLnByb2ZpbGUuZmluZE1hbnkoeyAuLi5hcmdzIH0pLFxuICAgIGNvdW50Rm46ICgpID0+IHByaXNtYS5wcm9maWxlLmNvdW50KClcbiAgfSlcblxuICByZXNcbiAgLnN0YXR1cygyMDApXG4gIC5zZW5kKHVzZXJzKVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgeyBSZXF1ZXN0IH0gZnJvbSAnZXhwcmVzcydcblxuZXhwb3J0IGNvbnN0IHVzZUZpcmViYXNlID0gKCkgPT4ge1xuICBjb25zdCBhcGlLZXkgPSAnQUl6YVN5RElyYUhrdUZXWWRJdFdFeWRjZTFkYmFBd0JzUk5OTWVBJ1xuICBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxYFxuXG4gIGNvbnN0IHNpZ25VcCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnblVwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlVXNlciA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpkZWxldGVgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBpZFRva2VuXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnbkluV2l0aFBhc3N3b3JkYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgY2hlY2tJZFRva2VuID0gYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmxvb2t1cGBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgaWRUb2tlbiA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb25cbiAgICBjb25zdCBib2R5ID0geyBpZFRva2VuIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgIGxldCBzdGF0dXNDb2RlXG4gICAgbGV0IHN0YXR1c01lc3NhZ2VcblxuICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgY2FzZSAnSU5WQUxJRF9QQVNTV09SRCc6XG4gICAgICBjYXNlICdFTUFJTF9OT1RfRk9VTkQnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDAxXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVW5hdXRob3JpemVkJ1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdPUEVSQVRJT05fTk9UX0FMTE9XRUQnOlxuICAgICAgY2FzZSAnVVNFUl9ESVNBQkxFRCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDNcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdGb3JiaWRkZW4nXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0VNQUlMX0VYSVNUUyc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDlcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdDb25mbGljdCdcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnVE9PX01BTllfQVRURU1QVFNfVFJZX0xBVEVSJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQyOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ1RvbyBNYW55IFJlcXVlc3RzJ1xuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdGF0dXNDb2RlID0gNTAwXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnSW50ZXJuYWwgU2VydmVyIEVycm9yJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2lnblVwLFxuICAgIGRlbGV0ZVVzZXIsXG4gICAgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQsXG4gICAgY2hlY2tJZFRva2VuLFxuICAgIGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UsXG4gIH1cbn1cbiIsImltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJ1xuXG4vKipcbiAqIFByaXNtYeOBp+ODmuODvOOCuOODjeODvOOCt+ODp+ODs+OCkuWun+ijheOBmeOCi++8iENsaWVudCBleHRlbnNpb25z44KC5L2/44Gj44Gm44G/44KL77yJXG4gKiBodHRwczovL3plbm4uZGV2L2dpYmphcGFuL2FydGljbGVzLzgxNWMwYTY3ODNkNWZmXG4gKi9cbnR5cGUgUGFnaW5hdGVJbnB1dHM8SXRlbXM+ID0ge1xuICBwYWdlOiBudW1iZXJcbiAgcGVyUGFnZTogbnVtYmVyXG4gIHF1ZXJ5Rm46IChhcmdzOiB7IHNraXA6IG51bWJlcjsgdGFrZTogbnVtYmVyIH0pID0+IFByb21pc2U8SXRlbXM+XG4gIGNvdW50Rm46ICgpID0+IFByb21pc2U8bnVtYmVyPlxufVxuXG50eXBlIFBhZ2luYXRlT3V0cHV0czxJdGVtcz4gPSB7XG4gIGl0ZW1zOiBJdGVtc1xuICBjb3VudDogbnVtYmVyXG4gIHBhZ2VDb3VudDogbnVtYmVyXG4gIGxpbmtzOiBhbnksXG4gIG1ldGE6IGFueVxufVxuXG4vKipcbiAqIOODmuODvOOCuOODjeODvOOCt+ODp+ODs+OBleOCjOOBn+ODh+ODvOOCv+OCkuWPluW+l+OBmeOCi1xuICovXG5leHBvcnQgY29uc3QgcGFnaW5hdGUgPSBhc3luYyA8SXRlbXM+KHJlcTogUmVxdWVzdCwge1xuICBwYWdlLFxuICBwZXJQYWdlLFxuICBjb3VudEZuLFxuICBxdWVyeUZuLFxufTogUGFnaW5hdGVJbnB1dHM8SXRlbXM+KTogUHJvbWlzZTxQYWdpbmF0ZU91dHB1dHM8SXRlbXM+PiA9PiB7XG4gIGNvbnN0IFtpdGVtcywgY291bnRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIHF1ZXJ5Rm4oe1xuICAgICAgc2tpcDogcGVyUGFnZSAqIChwYWdlIC0gMSksXG4gICAgICB0YWtlOiBwZXJQYWdlLFxuICAgIH0pLFxuICAgIGNvdW50Rm4oKSxcbiAgXSlcblxuICBjb25zdCBiYXNlVXJsID0gcmVxLmJhc2VVcmxcbiAgY29uc3QgcGFnZUNvdW50ID0gTWF0aC5jZWlsKGNvdW50IC8gcGVyUGFnZSlcbiAgY29uc3QgcGFnZVJhbmdlID0gMiAvLyDkvZXjg5rjg7zjgrjpmqPjgb7jgafjg5rjg7zjgrjnlarlj7fjg6njg5njg6vjgpLooajnpLrjgZnjgovjgYtcbiAgY29uc3QgZmlyc3RQYWdlID0gMVxuXG4gIGNvbnN0IGxpbmtzID0ge1xuICAgIGZpcnN0OiBgJHtiYXNlVXJsfS8/cGFnZT0xJnBlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgcHJldjogcGFnZSA9PT0gZmlyc3RQYWdlID8gJycgOiBgJHtiYXNlVXJsfS8/cGFnZT0ke3BhZ2UgLSAxfSZwZXJQYWdlPSR7cGVyUGFnZX1gLFxuICAgIG5leHQ6IHBhZ2UgPT09IHBhZ2VDb3VudCA/ICcnIDogYCR7YmFzZVVybH0vP3BhZ2U9JHtwYWdlICsgMX0mcGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgICBsYXN0OiBgJHtiYXNlVXJsfS8/cGFnZT0ke3BhZ2VDb3VudH0mcGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgfVxuXG4gIGNvbnN0IG1ldGFMaW5rcyA9IGNyZWF0ZVBhZ2VMYWJlbHMocGFnZSwgcGFnZUNvdW50LCBwYWdlUmFuZ2UsIGJhc2VVcmwsIHBlclBhZ2UpXG5cbiAgcmV0dXJuIHtcbiAgICBpdGVtcyxcbiAgICBjb3VudCxcbiAgICBwYWdlQ291bnQsXG4gICAgbGlua3MsXG4gICAgbWV0YTogeyBsaW5rczogbWV0YUxpbmtzIH0sXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVBhZ2VMYWJlbHMgPSAoXG4gIHBhZ2U6IG51bWJlciwgcGFnZUNvdW50OiBudW1iZXIsIHBhZ2VSYW5nZTogbnVtYmVyLCBiYXNlVXJsOiBzdHJpbmcsIHBlclBhZ2U6IG51bWJlclxuKSA9PiB7XG4gIGNvbnN0IGZpcnN0UGFnZSA9IDFcbiAgY29uc3QgbGFzdFBhZ2UgPSBwYWdlQ291bnRcbiAgY29uc3QgZHVwbGljYXRlZFZhbHVlcyA9IFtdXG5cbiAgaWYgKHBhZ2VDb3VudCA8PSA0KSB7XG4gICAgLy8g4piGIDTjg5rjg7zjgrjku6XkuIvjga7loLTlkIg6IFsxXSDvvZ4gWzEsIDIsIDMsIDRdXG4gICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogcGFnZUNvdW50IH0sIChfLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBpbmRleCArIDFcbiAgICAgIGR1cGxpY2F0ZWRWYWx1ZXMucHVzaCh7IGR1cGVDaGVja0xhYmVsOiBjdXJyZW50UGFnZSwgdmFsdWU6IGN1cnJlbnRQYWdlIH0pXG4gICAgfSlcbiAgfSBlbHNlIGlmIChwYWdlID09PSBmaXJzdFBhZ2UpIHtcbiAgICAvLyDimIUg5pyA5Yid44Gu44Oa44O844K4KOOBquOBiuOBi+OBpDXjg5rjg7zjgrjku6XkuIop44Gu5aC05ZCIOiBbMSwgMiwgMywgLi4uLCA1XVxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IDMgfSwgKF8sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50UGFnZSA9IGluZGV4ICsgMVxuICAgICAgZHVwbGljYXRlZFZhbHVlcy5wdXNoKHtcbiAgICAgICAgZHVwZUNoZWNrTGFiZWw6IGN1cnJlbnRQYWdlLFxuICAgICAgICB2YWx1ZTogY3VycmVudFBhZ2UsXG4gICAgICAgIHVybDogYCR7YmFzZVVybH0vP3BhZ2U9JHtjdXJyZW50UGFnZX0mcGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgICAgICAgYWN0aXZlOiBwYWdlID09PSBjdXJyZW50UGFnZSxcbiAgICAgIH0pXG4gICAgfSlcbiAgICBkdXBsaWNhdGVkVmFsdWVzLnB1c2goXG4gICAgICB7IGR1cGVDaGVja0xhYmVsOiAnbGVmdERvdCcsIHZhbHVlOiAnLi4uJywgdXJsOiAnJywgYWN0aXZlOiBmYWxzZSB9LFxuICAgICAgeyBkdXBlQ2hlY2tMYWJlbDogbGFzdFBhZ2UsIHZhbHVlOiBsYXN0UGFnZSwgdXJsOiBgJHtiYXNlVXJsfS8/cGFnZT0ke2xhc3RQYWdlfSZwZXJQYWdlPSR7cGVyUGFnZX1gLCBhY3RpdmU6IGZhbHNlIH0sXG4gICAgICB7IGR1cGVDaGVja0xhYmVsOiAnTmV4dCcsIHZhbHVlOiAnTmV4dCcsIHVybDogYCR7YmFzZVVybH0vP3BhZ2U9JHtwYWdlICsgMX0mcGVyUGFnZT0ke3BlclBhZ2V9YCwgYWN0aXZlOiBmYWxzZSB9LFxuICAgIClcbiAgfSBlbHNlIGlmIChwYWdlID09PSBsYXN0UGFnZSkge1xuICAgIC8vIOKYhiDmnIDlvozjga7jg5rjg7zjgrgo44Gq44GK44GL44GkNeODmuODvOOCuOS7peS4iinjga7loLTlkIg6IFsxLCAuLi4sIDMsIDQsIDVdXG4gICAgZHVwbGljYXRlZFZhbHVlcy5wdXNoKHsgZHVwZUNoZWNrTGFiZWw6IGZpcnN0UGFnZSwgdmFsdWU6IGZpcnN0UGFnZSB9LCB7IGR1cGVDaGVja0xhYmVsOiAncmlnaHREb3QnLCB2YWx1ZTogJy4uLicgfSlcbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiAzIH0sIChfLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBpbmRleCArIHBhZ2UgLSBwYWdlUmFuZ2VcbiAgICAgIGR1cGxpY2F0ZWRWYWx1ZXMucHVzaCh7IGR1cGVDaGVja0xhYmVsOiBjdXJyZW50UGFnZSwgdmFsdWU6IGN1cnJlbnRQYWdlIH0pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICAvLyDimIYg44Gd44KM5Lul5aSW44Gu44Oa44O844K444Gu5aC05ZCIXG4gICAgLy8gYHBhZ2Vg44Gu5bem5Y+z44GU44Go44Gr44CBKOacgOWInXzmnIDlvowp44Gu44Oa44O844K4IO+9niDnj77lnKjjga7jg5rjg7zjgrjjgb7jgafjgYzpgKPntprnmoTjgafjgYLjgovjgYvlkKbjgYvjgpLliKTlrprjgZfntZDmnpzjgpLphY3liJfjgavmoLzntI3jgZnjgotcbiAgICBjb25zdCBpc0NvbnRpbnVvdXM6IGJvb2xlYW5bXSA9ICgocGFnZTogbnVtYmVyLCBwYWdlQ291bnQ6IG51bWJlciwgcGFnZVJhbmdlOiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdDogYm9vbGVhbltdID0gW11cblxuICAgICAgLy8g5pyA5aSnMuWbnuODq+ODvOODl+WHpueQhuOCkuWun+ihjOOBmeOCiyAoMeWbnuebruOBr+W3puWBtOOAgTLlm57nm67jga/lj7PlgbQpXG4gICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyIH0sIChfLCBpbmRleCkgPT4ge1xuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAvLyDjg6vjg7zjg5cx5Zue55uu44Gv5bem5YG044Gu6YCj57aa5oCn44KS6Kq/44G544KLXG4gICAgICAgICAgcmVzdWx0LnB1c2gocGFnZSAtIHBhZ2VSYW5nZSAtIDEgPD0gMSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDjg6vjg7zjg5cy5Zue55uu44Gv5Y+z5YG044Gu6YCj57aa5oCn44KS6Kq/44G544KLXG4gICAgICAgICAgcmVzdWx0LnB1c2gocGFnZUNvdW50IC0gcGFnZSA8PSBwYWdlUmFuZ2UgKyAxKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0pKHBhZ2UsIHBhZ2VDb3VudCwgcGFnZVJhbmdlKVxuXG4gICAgLy8gaXNDb250aW51b3VzKGxlbmd0aDogMinjgafjg6vjg7zjg5flh6bnkIbjgpLlrp/ooYzjgZfjgIHlt6blj7Pjga7jg5rjg7zjgrjnlarlj7fjg6njg5njg6vjgpLphY3liJcoZHVwbGljYXRlZFZhbHVlcynjgavmoLzntI3jgZnjgotcbiAgICBpc0NvbnRpbnVvdXMuZm9yRWFjaCgoaXNDb250aW51b3VzLCBpbmRleCkgPT4ge1xuXG4gICAgICAvLyDjg6vjg7zjg5cx5Zue55uu44Gv5bem5YG044Gu44Oa44O844K455Wq5Y+344Op44OZ44Or44KS5qC857SN44GZ44KLXG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgY29uc3QgbGVmdFBhZ2VMYWJlbHMgPSBbXVxuICAgICAgICAvLyDpgKPntprnmoTjgafjgYLjgotcbiAgICAgICAgaWYgKGlzQ29udGludW91cykge1xuICAgICAgICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IHBhZ2UgfSwgKF8sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IGluZGV4ICsgMVxuICAgICAgICAgICAgbGVmdFBhZ2VMYWJlbHMucHVzaCh7IGR1cGVDaGVja0xhYmVsOiBjdXJyZW50UGFnZSwgdmFsdWU6IGN1cnJlbnRQYWdlIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDpnZ7pgKPntprnmoTjgafjgYLjgotcbiAgICAgICAgICBsZWZ0UGFnZUxhYmVscy5wdXNoKHsgZHVwZUNoZWNrTGFiZWw6IGZpcnN0UGFnZSwgdmFsdWU6IGZpcnN0UGFnZSB9KVxuICAgICAgICAgIGxlZnRQYWdlTGFiZWxzLnB1c2goeyBkdXBlQ2hlY2tMYWJlbDogJ2xlZnREb3QnLCB2YWx1ZTogJy4uLicgfSlcbiAgICAgICAgICBBcnJheS5mcm9tKHsgIGxlbmd0aDogMyB9LCAoXywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gaW5kZXggKyBwYWdlIC0gcGFnZVJhbmdlXG4gICAgICAgICAgICBsZWZ0UGFnZUxhYmVscy5wdXNoKHsgZHVwZUNoZWNrTGFiZWw6IGN1cnJlbnRQYWdlLCB2YWx1ZTogY3VycmVudFBhZ2UgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGxlZnRQYWdlTGFiZWxzLmZvckVhY2godiA9PiBkdXBsaWNhdGVkVmFsdWVzLnB1c2godikpXG5cbiAgICAgIC8vIOODq+ODvOODlzLlm57nm67jga/lj7PlgbTjga7jg5rjg7zjgrjnlarlj7fjg6njg5njg6vjgpLmoLzntI3jgZnjgotcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0UGFnZUxhYmVscyA9IFtdXG4gICAgICAgIC8vIOmAo+e2mueahOOBp+OBguOCi1xuICAgICAgICBpZiAoaXNDb250aW51b3VzKSB7XG4gICAgICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogcGFnZUNvdW50IC0gcGFnZSArIDEgfSwgKF8sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IGluZGV4ICsgcGFnZVxuICAgICAgICAgICAgcmlnaHRQYWdlTGFiZWxzLnB1c2goeyBkdXBlQ2hlY2tMYWJlbDogY3VycmVudFBhZ2UsIHZhbHVlOiBjdXJyZW50UGFnZSB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIC8vIOmdnumAo+e2mueahOOBp+OBguOCi1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEFycmF5LmZyb20oeyAgbGVuZ3RoOiAzIH0sIChfLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBpbmRleCArIHBhZ2VcbiAgICAgICAgICAgIHJpZ2h0UGFnZUxhYmVscy5wdXNoKHsgZHVwZUNoZWNrTGFiZWw6IGN1cnJlbnRQYWdlLCB2YWx1ZTogY3VycmVudFBhZ2UgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJpZ2h0UGFnZUxhYmVscy5wdXNoKHsgZHVwZUNoZWNrTGFiZWw6ICdyaWdodERvdCcsIHZhbHVlOiAnLi4uJyB9KVxuICAgICAgICAgIHJpZ2h0UGFnZUxhYmVscy5wdXNoKHsgZHVwZUNoZWNrTGFiZWw6IHBhZ2VDb3VudCwgdmFsdWU6IHBhZ2VDb3VudCB9KVxuICAgICAgICB9XG4gICAgICAgIC8vIOOBk+OBruihjOOBp+W3puWPs+OBruODmuODvOOCuOeVquWPt+ODqeODmeODq+OBjOe1kOWQiOOBleOCjOOCiyAo44GT44Gu5pmC54K544Gn44Gv6YeN6KSH44GC44KKKVxuICAgICAgICByaWdodFBhZ2VMYWJlbHMuZm9yRWFjaCh2ID0+IGR1cGxpY2F0ZWRWYWx1ZXMucHVzaCh2KSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLy8g6YeN6KSH44KS5o6S6Zmk44GZ44KLXG4gIGNvbnN0IHVuaXF1ZVZhbHVlcyA9IGR1cGxpY2F0ZWRWYWx1ZXMuZmlsdGVyKChlbGVtZW50LCBpbmRleCwgc2VsZikgPT5cbiAgICBzZWxmLmZpbmRJbmRleChlID0+IGUuZHVwZUNoZWNrTGFiZWwgPT09IGVsZW1lbnQuZHVwZUNoZWNrTGFiZWwpID09PSBpbmRleFxuICApXG4gIGNvbnN0IHBhZ2VMYWJlbHMgPSB1bmlxdWVWYWx1ZXMubWFwKGVsZW1lbnQgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogKHVuaXF1ZVZhbHVlcy5pbmRleE9mKGVsZW1lbnQpICsgMSkudG9TdHJpbmcoKSxcbiAgICAgIGxhYmVsOiBlbGVtZW50LnZhbHVlLnRvU3RyaW5nKCksXG4gICAgICB1cmw6IGVsZW1lbnQudXJsPy50b1N0cmluZygpLFxuICAgICAgYWN0aXZlOiBlbGVtZW50LmFjdGl2ZT8udG9TdHJpbmcoKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHBhZ2VMYWJlbHNcbn1cblxuZXhwb3J0IGNvbnN0IGFkZE5hdmlnYXRlQnRuID0gKHBhZ2VMYWJlbHM6IHN0cmluZ1tdLCBwYWdlOiBudW1iZXIpID0+IHtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkBwcmlzbWEvY2xpZW50XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ2YWxpZGF0b3JcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiem9kXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=