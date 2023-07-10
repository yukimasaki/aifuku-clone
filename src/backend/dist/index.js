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
const paginate_test_1 = __webpack_require__(/*! src/utils/paginate-test */ "./src/utils/paginate-test.ts");
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
    const users = await (0, paginate_test_1.paginate)(req, {
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

/***/ "./src/utils/paginate-test.ts":
/*!************************************!*\
  !*** ./src/utils/paginate-test.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.paginate = void 0;
async function paginate(req, { page, perPage, countFn, queryFn, }) {
    const [items, count] = await Promise.all([
        queryFn({
            skip: perPage * (page - 1),
            take: perPage,
        }),
        countFn(),
    ]);
    const pageCount = Math.ceil(count / perPage);
    const firstPage = 1;
    const neighbor = 2;
    console.log(req);
    const baseUrl = req.baseUrl;
    const links = {
        first: `${baseUrl}/?page=1&?perPage=${perPage}`,
        prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&?perPage=${perPage}`,
        next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&?perPage=${perPage}`,
        last: `${baseUrl}/?page=${pageCount}&?perPage=${perPage}`,
    };
    const options = createLinkDefinition(page, pageCount, neighbor, firstPage);
    const metaLinks = createLinkArray(page, perPage, pageCount, neighbor, options, links, baseUrl);
    return {
        items,
        count,
        pageCount,
        links,
        meta: { links: metaLinks },
    };
}
exports.paginate = paginate;
const createLinkDefinition = (page, pageCount, neighbor, firstPage) => {
    if (page === firstPage) {
        return {
            prevLabel: false,
            dotLeft: false,
            dotRight: true,
            NextLabel: true,
        };
    }
    else if (page === pageCount) {
        return {
            prevLabel: true,
            dotLeft: false,
            dotRight: false,
            NextLabel: false,
        };
    }
    else if ((page - neighbor) <= neighbor) {
        return {
            prevLabel: true,
            dotLeft: false,
            dotRight: true,
            NextLabel: true,
        };
    }
    else if ((pageCount - page - 1) <= neighbor) {
        return {
            prevLabel: true,
            dotLeft: true,
            dotRight: false,
            NextLabel: true,
        };
    }
    else {
        return {
            prevLabel: true,
            dotLeft: true,
            dotRight: true,
            NextLabel: true,
        };
    }
};
const createLinkArray = (page, perPage, pageCount, neighbor, options, links, baseUrl) => {
    const { prevLabel, dotLeft, dotRight, NextLabel } = options;
    const linkArray = [];
    if (prevLabel) {
        linkArray.push({
            url: links.prev,
            label: 'Prev',
            active: false,
        });
    }
    linkArray.push({
        url: links.first,
        label: '1',
        active: page === 1,
    });
    if (dotLeft) {
        linkArray.push({
            url: '',
            label: '...',
            active: false,
        });
    }
    Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
        const pageNumber = index + (page - neighbor);
        linkArray.push({
            url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
            label: pageNumber,
            active: page === pageNumber,
        });
    });
    if (dotRight) {
        linkArray.push({
            url: '',
            label: '...',
            active: false,
        });
    }
    linkArray.push({
        url: links.last,
        label: pageCount,
        active: page === pageCount,
    });
    if (NextLabel) {
        linkArray.push({
            url: links.next,
            label: 'Next',
            active: false,
        });
    }
    return linkArray;
};


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZCxDQUFDO0tBQ0g7SUFHRCxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ2IsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2YsS0FBSyxFQUFFLFNBQVM7UUFDaEIsTUFBTSxFQUFFLElBQUksS0FBSyxTQUFTO0tBQzNCLENBQUM7SUFHRixJQUFJLFNBQVMsRUFBRTtRQUNiLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDYixHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsTUFBTTtZQUNiLE1BQU0sRUFBRSxLQUFLO1NBQ2QsQ0FBQztLQUNIO0lBRUQsT0FBTyxTQUFTO0FBQ2xCLENBQUM7Ozs7Ozs7Ozs7O0FDeExEOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9hcHAudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvbWlkZGxld2FyZS92ZXJpZnkudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL2xvZ2luLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3JvdXRlcy91c2Vycy50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy91dGlscy9maXJlYmFzZS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy91dGlscy9wYWdpbmF0ZS10ZXN0LnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQHByaXNtYS9jbGllbnRcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImNvcnNcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcInZhbGlkYXRvclwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiem9kXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuXG5pbXBvcnQgdXNlclJvdXRlciBmcm9tICcuL3JvdXRlcy91c2VycydcbmltcG9ydCBsb2dpblJvdXRlciBmcm9tICcuL3JvdXRlcy9sb2dpbidcblxuY29uc3QgYXBwID0gZXhwcmVzcygpXG5hcHAudXNlKGNvcnMoKSlcbmFwcC51c2UoZXhwcmVzcy5qc29uKCkpXG5hcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKVxuXG5jb25zdCBwb3J0ID0gMzAwMFxuXG5hcHAudXNlKCcvYXBpL3VzZXJzJywgdXNlclJvdXRlcilcbmFwcC51c2UoJy9hcGkvbG9naW4nLCBsb2dpblJvdXRlcilcblxuYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApXG59KVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gXCJzcmMvdXRpbHMvZmlyZWJhc2VcIlxuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgY2hlY2tJZFRva2VuIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjaGVja0lkVG9rZW4ocmVxKVxuXG4gIGlmICghdXNlci5lcnJvcikge1xuICAgIHJldHVybiBuZXh0KClcbiAgfVxuXG4gIHJlcy5zZW5kKHtcbiAgICBzdGF0dXNDb2RlOiB1c2VyLmVycm9yLmNvZGUsXG4gICAgc3RhdHVzTWVzc2FnZTogJ1VuYXV0aG9yaXplZCcsXG4gICAgbWVzc2FnZTogdXNlci5lcnJvci5tZXNzYWdlLFxuICB9KVxufVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tICdzcmMvdXRpbHMvZmlyZWJhc2UnXG5pbXBvcnQgeyB2ZXJpZnkgfSBmcm9tICcuLi9taWRkbGV3YXJlL3ZlcmlmeSdcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vKiogUE9TVCAvdXNlci9sb2dpbiAqL1xucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGxvZ2luYClcbiAgICBjb25zdCB7IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZClcblxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVMb2dpbiA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUxvZ2luYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgpLoqabjgb/jgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlTG9naW4odXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OBq+aIkOWKn+OBl+OBn+OCieOCr+ODg+OCreODvOOCkuS/neWtmOOBmeOCi1xuICBjb25zdCB0aW1lID0gNjAgKiA2MCAqIDEwMDBcbiAgY29uc3QgZXhwaXJlcyA9IG5ldyBEYXRlKERhdGUubm93KCkgKyB0aW1lKVxuXG4gIHJlcy5jb29raWUoJ3Rva2VuJywgdXNlci5pZFRva2VuLCB7XG4gICAgZXhwaXJlczogZXhwaXJlcyxcbiAgICAvLyBodHRwT25seTogdHJ1ZSxcbiAgICAvLyBzZWN1cmU6IHRydWUsXG4gIH0pXG5cbiAgcmVzXG4gIC5zZW5kKHtcbiAgICB1aWQ6IHVzZXIubG9jYWxJZCxcbiAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgfSlcbn0pXG5cbi8qKiBERUxFVEUgL3VzZXIvbG9naW4gKi9cbnJvdXRlci5kZWxldGUoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcbiAgdHJ5IHtcbiAgICByZXNcbiAgICAuY2xlYXJDb29raWUoJ3Rva2VuJylcbiAgICAuc2VuZCh7fSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXMuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcbiAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGVycm9yJyxcbiAgICB9KVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnIC8v44Gf44KB44GX44Gr5L2/44Gj44Gm44G/44KLXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSAnLi4vbWlkZGxld2FyZS92ZXJpZnknXG4vLyBpbXBvcnQgeyBwYWdpbmF0ZSB9IGZyb20gJ3NyYy91dGlscy9wYWdpbmF0ZSdcbmltcG9ydCB7IHBhZ2luYXRlIH0gZnJvbSAnc3JjL3V0aWxzL3BhZ2luYXRlLXRlc3QnXG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKClcbmNvbnN0IHByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKVxuXG4vKiogUE9TVCAvYXBpL3VzZXJzICovXG5yb3V0ZXIucG9zdCgnLycsIHZlcmlmeSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHZhbGlkID0gKFxuICAgIGVtYWlsOiBhbnksXG4gICAgcGFzc3dvcmQ6IGFueSxcbiAgICBkaXNwbGF5TmFtZTogYW55LFxuICAgIHRlbmFudElkOiBhbnksXG4gICkgPT4ge1xuICAgIGNvbnN0IHJ1bGVFbWFpbCA9ICgpID0+IHZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKVxuICAgIGNvbnN0IHJ1bGVQYXNzd29yZCA9ICgpID0+IHZhbGlkYXRvci5pc1N0cm9uZ1Bhc3N3b3JkKHBhc3N3b3JkLCB7IG1pbkxlbmd0aDogNiB9KVxuICAgIGNvbnN0IHJ1bGVEaXNwbGF5TmFtZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGlzU29tZVRleHQgPSBbXG4gICAgICAgIHZhbGlkYXRvci5pc0FzY2lpKGRpc3BsYXlOYW1lKSxcbiAgICAgICAgdmFsaWRhdG9yLmlzTXVsdGlieXRlKGRpc3BsYXlOYW1lKSxcbiAgICAgIF0uc29tZShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgICBjb25zdCBpc1ZhbGlkID0gW1xuICAgICAgICBpc1NvbWVUZXh0LFxuICAgICAgICB2YWxpZGF0b3IuaXNMZW5ndGgoZGlzcGxheU5hbWUsIHsgbWluOiAxLCBtYXg6IDMyIH0pLFxuICAgICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgICByZXR1cm4gaXNWYWxpZFxuICAgIH1cbiAgICBjb25zdCBydWxlVGVuYW50SWQgPSAoKSA9PiB2YWxpZGF0b3IuaXNJbnQodGVuYW50SWQpXG5cbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gW1xuICAgICAgcnVsZUVtYWlsKCksXG4gICAgICBydWxlUGFzc3dvcmQoKSxcbiAgICAgIHJ1bGVEaXNwbGF5TmFtZSgpLFxuICAgICAgcnVsZVRlbmFudElkKCksXG4gICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICAgIGNvbnN0IHsgc2lnblVwIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25VcChlbWFpbCwgcGFzc3dvcmQpXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2VgKVxuICAgIGNvbnN0IHsgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH0gPSBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9XG4gIH1cblxuICBjb25zdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChcbiAgICB1aWQ6IHN0cmluZyxcbiAgICBlbWFpbDogc3RyaW5nLFxuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmcsXG4gICAgdGVuYW50SWQ6IHN0cmluZyxcbiAgICApID0+IHtcbiAgICBjb25zb2xlLmxvZyhgY3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBwcmlzbWEucHJvZmlsZS5jcmVhdGUoe1xuICAgICAgZGF0YToge1xuICAgICAgICB1aWQsXG4gICAgICAgIGVtYWlsLFxuICAgICAgICBkaXNwbGF5TmFtZSxcbiAgICAgICAgdGVuYW50SWQ6IHBhcnNlSW50KHRlbmFudElkKSxcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcm9maWxlKVxuICB9XG5cbiAgY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoaWRUb2tlbjogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlYClcbiAgICBjb25zdCB7IGRlbGV0ZVVzZXIgfSA9IHVzZUZpcmViYXNlKClcbiAgICBhd2FpdCBkZWxldGVVc2VyKGlkVG9rZW4pXG4gIH1cblxuICBjb25zdCBib2R5ID0gcmVxLmJvZHlcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZCB9ID0gYm9keVxuXG4gIC8vIOODquOCr+OCqOOCueODiOODnOODh+OCo+OBp+a4oeOBleOCjOOBn0pTT07jg4fjg7zjgr/jgYzkuI3mraPjgarloLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIWRpc3BsYXlOYW1lIHx8ICF0ZW5hbnRJZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZClcbiAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxuXG4gIC8vIEZpcmViYXNl44G444Om44O844K255m76Yyy44GZ44KLXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjcmVhdGVVc2VyVG9GaXJlYmFzZShlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICh1c2VyLmVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOBqOODoeODg+OCu+ODvOOCuOOCkuWQq+OCgEpTT07jg4fjg7zjgr/jgpLov5TjgZlcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfSA9IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlKHVzZXIuZXJyb3IpXG4gICAgcmVzXG4gICAgLnN0YXR1cyhzdGF0dXNDb2RlKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGUsXG4gICAgICBzdGF0dXNNZXNzYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OH44O844K/44OZ44O844K544G444OX44Ot44OV44Kj44O844Or5oOF5aCx44KS55m76Yyy44GZ44KLXG4gIHRyeSB7XG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGNyZWF0ZVVzZXJUb0RhdGFiYXNlKHVzZXIubG9jYWxJZCwgZW1haWwsIGRpc3BsYXlOYW1lLCB0ZW5hbnRJZClcbiAgICByZXMuc2VuZChwcm9maWxlKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUZpcmViYXNl44GL44KJ44OH44O844K/44KS5YmK6Zmk44GX44GmSFRUUOOCueODhuODvOOCv+OCueOCs+ODvOODieOCkui/lOOBmVxuICAgIGF3YWl0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlKHVzZXIuaWRUb2tlbilcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0NyZWF0ZSB0byBkYXRhYmFzZSBmYWlsZWQnLFxuICAgIH0pXG4gIH1cbn0pXG5cbi8qKiBHRVQgL2FwaS91c2VycyAqL1xuLy8gcm91dGVyLmdldCgnLycsIHZlcmlmeSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG5yb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IHsgcGFnZSwgcGVyUGFnZSB9ID0gcmVxLnF1ZXJ5XG5cbiAgY29uc3QgcnVsZVBhZ2UgPSB6LmNvZXJjZS5udW1iZXIoKS5pbnQoKS5taW4oMSlcbiAgY29uc3QgcnVsZVBlclBhZ2UgPSB6LmNvZXJjZS5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDEwMClcblxuICBjb25zdCB1c2VycyA9IGF3YWl0IHBhZ2luYXRlKHJlcSx7XG4gICAgcGFnZTogcnVsZVBhZ2UucGFyc2UocGFnZSksXG4gICAgcGVyUGFnZTogcnVsZVBlclBhZ2UucGFyc2UocGVyUGFnZSksXG4gICAgcXVlcnlGbjogKGFyZ3MpID0+XG4gICAgICBwcmlzbWEucHJvZmlsZS5maW5kTWFueSh7IC4uLmFyZ3MgfSksXG4gICAgY291bnRGbjogKCkgPT4gcHJpc21hLnByb2ZpbGUuY291bnQoKVxuICB9KVxuXG4gIHJlc1xuICAuc3RhdHVzKDIwMClcbiAgLnNlbmQodXNlcnMpXG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJ1xuXG5leHBvcnQgY29uc3QgdXNlRmlyZWJhc2UgPSAoKSA9PiB7XG4gIGNvbnN0IGFwaUtleSA9ICdBSXphU3lESXJhSGt1RldZZEl0V0V5ZGNlMWRiYUF3QnNSTk5NZUEnXG4gIGNvbnN0IGJhc2VVcmwgPSBgaHR0cHM6Ly9pZGVudGl0eXRvb2xraXQuZ29vZ2xlYXBpcy5jb20vdjFgXG5cbiAgY29uc3Qgc2lnblVwID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduVXBgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBkZWxldGVVc2VyID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmRlbGV0ZWBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGlkVG9rZW5cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpzaWduSW5XaXRoUGFzc3dvcmRgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcmV0dXJuU2VjdXJlVG9rZW46IHRydWUsXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBjaGVja0lkVG9rZW4gPSBhc3luYyAocmVxOiBSZXF1ZXN0KSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6bG9va3VwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBpZFRva2VuID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgIGNvbnN0IGJvZHkgPSB7IGlkVG9rZW4gfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHN0YXR1c0NvZGVcbiAgICBsZXQgc3RhdHVzTWVzc2FnZVxuXG4gICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICBjYXNlICdJTlZBTElEX1BBU1NXT1JEJzpcbiAgICAgIGNhc2UgJ0VNQUlMX05PVF9GT1VORCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDFcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdVbmF1dGhvcml6ZWQnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ09QRVJBVElPTl9OT1RfQUxMT1dFRCc6XG4gICAgICBjYXNlICdVU0VSX0RJU0FCTEVEJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwM1xuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ZvcmJpZGRlbidcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnRU1BSUxfRVhJU1RTJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0NvbmZsaWN0J1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdUT09fTUFOWV9BVFRFTVBUU19UUllfTEFURVInOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDI5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVG9vIE1hbnkgUmVxdWVzdHMnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA1MDBcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzaWduVXAsXG4gICAgZGVsZXRlVXNlcixcbiAgICBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCxcbiAgICBjaGVja0lkVG9rZW4sXG4gICAgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSxcbiAgfVxufVxuIiwiaW1wb3J0IHsgUmVxdWVzdCB9IGZyb20gJ2V4cHJlc3MnXG5cbi8qKlxuICogUHJpc21h44Gn44Oa44O844K444ON44O844K344On44Oz44KS5a6f6KOF44GZ44KL77yIQ2xpZW50IGV4dGVuc2lvbnPjgoLkvb/jgaPjgabjgb/jgovvvIlcbiAqIGh0dHBzOi8vemVubi5kZXYvZ2liamFwYW4vYXJ0aWNsZXMvODE1YzBhNjc4M2Q1ZmZcbiAqL1xudHlwZSBQYWdpbmF0ZUlucHV0czxJdGVtcz4gPSB7XG4gIHBhZ2U6IG51bWJlclxuICBwZXJQYWdlOiBudW1iZXJcbiAgcXVlcnlGbjogKGFyZ3M6IHsgc2tpcDogbnVtYmVyOyB0YWtlOiBudW1iZXIgfSkgPT4gUHJvbWlzZTxJdGVtcz5cbiAgY291bnRGbjogKCkgPT4gUHJvbWlzZTxudW1iZXI+XG59XG5cbnR5cGUgUGFnaW5hdGVPdXRwdXRzPEl0ZW1zPiA9IHtcbiAgaXRlbXM6IEl0ZW1zXG4gIGNvdW50OiBudW1iZXJcbiAgcGFnZUNvdW50OiBudW1iZXJcbiAgbGlua3M6IGFueSxcbiAgbWV0YTogYW55XG59XG5cbnR5cGUgTGlua0RlZmluaXRpb24gPSB7XG4gIHByZXZMYWJlbDogYm9vbGVhblxuICBkb3RMZWZ0OiBib29sZWFuXG4gIGRvdFJpZ2h0OiBib29sZWFuXG4gIE5leHRMYWJlbDogYm9vbGVhblxufVxuXG4vKipcbiAqIOODmuODvOOCuOODjeODvOOCt+ODp+ODs+OBleOCjOOBn+ODh+ODvOOCv+OCkuWPluW+l+OBmeOCi1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFnaW5hdGU8SXRlbXM+KHJlcTogUmVxdWVzdCwge1xuICBwYWdlLFxuICBwZXJQYWdlLFxuICBjb3VudEZuLFxuICBxdWVyeUZuLFxufTogUGFnaW5hdGVJbnB1dHM8SXRlbXM+KTogUHJvbWlzZTxQYWdpbmF0ZU91dHB1dHM8SXRlbXM+PiB7XG4gIGNvbnN0IFtpdGVtcywgY291bnRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIHF1ZXJ5Rm4oe1xuICAgICAgc2tpcDogcGVyUGFnZSAqIChwYWdlIC0gMSksXG4gICAgICB0YWtlOiBwZXJQYWdlLFxuICAgIH0pLFxuICAgIGNvdW50Rm4oKSxcbiAgXSlcblxuICBjb25zdCBwYWdlQ291bnQgPSBNYXRoLmNlaWwoY291bnQgLyBwZXJQYWdlKVxuICBjb25zdCBmaXJzdFBhZ2UgPSAxXG4gIGNvbnN0IG5laWdoYm9yID0gMlxuXG4gIGNvbnNvbGUubG9nKHJlcSlcbiAgY29uc3QgYmFzZVVybCA9IHJlcS5iYXNlVXJsXG5cbiAgY29uc3QgbGlua3MgPSB7XG4gICAgZmlyc3Q6IGAke2Jhc2VVcmx9Lz9wYWdlPTEmP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgcHJldjogcGFnZSA9PT0gZmlyc3RQYWdlID8gJycgOiBgJHtiYXNlVXJsfS8/cGFnZT0ke3BhZ2UgLSAxfSY/cGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgICBuZXh0OiBwYWdlID09PSBwYWdlQ291bnQgPyAnJyA6IGAke2Jhc2VVcmx9Lz9wYWdlPSR7cGFnZSArIDF9Jj9wZXJQYWdlPSR7cGVyUGFnZX1gLFxuICAgIGxhc3Q6IGAke2Jhc2VVcmx9Lz9wYWdlPSR7cGFnZUNvdW50fSY/cGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgfVxuXG4gIC8vIOODmuODvOOCuOODjeODvOOCt+ODp+ODs+eUqOODquODs+OCr+OBrumFjeWIl+Wumue+qSjjgqrjg5bjgrjjgqfjgq/jg4gp44KS5p2h5Lu25YiG5bKQ44Gr5b6T44Gj44Gm55Sf5oiQ44GZ44KLXG4gIGNvbnN0IG9wdGlvbnMgPSBjcmVhdGVMaW5rRGVmaW5pdGlvbihwYWdlLCBwYWdlQ291bnQsIG5laWdoYm9yLCBmaXJzdFBhZ2UpXG4gIGNvbnN0IG1ldGFMaW5rcyA9IGNyZWF0ZUxpbmtBcnJheShwYWdlLCBwZXJQYWdlLCBwYWdlQ291bnQsIG5laWdoYm9yLCBvcHRpb25zLCBsaW5rcywgYmFzZVVybClcblxuICByZXR1cm4ge1xuICAgIGl0ZW1zLFxuICAgIGNvdW50LFxuICAgIHBhZ2VDb3VudCxcbiAgICBsaW5rcyxcbiAgICBtZXRhOiB7IGxpbmtzOiBtZXRhTGlua3MgfSxcbiAgfVxufVxuXG5jb25zdCBjcmVhdGVMaW5rRGVmaW5pdGlvbiA9IChwYWdlOiBudW1iZXIsIHBhZ2VDb3VudDogbnVtYmVyLCBuZWlnaGJvcjogbnVtYmVyLCBmaXJzdFBhZ2U6IG51bWJlcikgPT4ge1xuICBpZiAocGFnZSA9PT0gZmlyc3RQYWdlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZMYWJlbDogZmFsc2UsXG4gICAgICBkb3RMZWZ0OiBmYWxzZSxcbiAgICAgIGRvdFJpZ2h0OiB0cnVlLFxuICAgICAgTmV4dExhYmVsOiB0cnVlLFxuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09PSBwYWdlQ291bnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJldkxhYmVsOiB0cnVlLFxuICAgICAgZG90TGVmdDogZmFsc2UsXG4gICAgICBkb3RSaWdodDogZmFsc2UsXG4gICAgICBOZXh0TGFiZWw6IGZhbHNlLFxuICAgIH1cbiAgfSBlbHNlIGlmICgocGFnZSAtIG5laWdoYm9yKSA8PSBuZWlnaGJvcikge1xuICAgIHJldHVybiB7XG4gICAgICBwcmV2TGFiZWw6IHRydWUsXG4gICAgICBkb3RMZWZ0OiBmYWxzZSxcbiAgICAgIGRvdFJpZ2h0OiB0cnVlLFxuICAgICAgTmV4dExhYmVsOiB0cnVlLFxuICAgIH1cbiAgfSBlbHNlIGlmICgocGFnZUNvdW50IC0gcGFnZSAtIDEpIDw9IG5laWdoYm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZMYWJlbDogdHJ1ZSxcbiAgICAgIGRvdExlZnQ6IHRydWUsXG4gICAgICBkb3RSaWdodDogZmFsc2UsXG4gICAgICBOZXh0TGFiZWw6IHRydWUsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBwcmV2TGFiZWw6IHRydWUsXG4gICAgICBkb3RMZWZ0OiB0cnVlLFxuICAgICAgZG90UmlnaHQ6IHRydWUsXG4gICAgICBOZXh0TGFiZWw6IHRydWUsXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGNyZWF0ZUxpbmtBcnJheSA9IChcbiAgcGFnZTogbnVtYmVyLFxuICBwZXJQYWdlOiBudW1iZXIsXG4gIHBhZ2VDb3VudDogbnVtYmVyLFxuICBuZWlnaGJvcjogbnVtYmVyLFxuICBvcHRpb25zOiBMaW5rRGVmaW5pdGlvbixcbiAgbGlua3M6IGFueSxcbiAgYmFzZVVybDogc3RyaW5nXG4pID0+IHtcbiAgY29uc3QgeyBwcmV2TGFiZWwsIGRvdExlZnQsIGRvdFJpZ2h0LCBOZXh0TGFiZWwgfSA9IG9wdGlvbnNcbiAgY29uc3QgbGlua0FycmF5ID0gW11cblxuICAvLyDmiLvjgovjg5zjgr/jg7Pjga/lv4XopoHjgavlv5zjgZjjgabooajnpLpcbiAgaWYgKHByZXZMYWJlbCkge1xuICAgIGxpbmtBcnJheS5wdXNoKHtcbiAgICAgIHVybDogbGlua3MucHJldixcbiAgICAgIGxhYmVsOiAnUHJldicsXG4gICAgICBhY3RpdmU6IGZhbHNlLFxuICAgIH0pXG4gIH1cblxuICAvLyDmnIDliJ3jga7jg5rjg7zjgrjjga/lv4XjgZrooajnpLpcbiAgbGlua0FycmF5LnB1c2goe1xuICAgIHVybDogbGlua3MuZmlyc3QsXG4gICAgbGFiZWw6ICcxJyxcbiAgICBhY3RpdmU6IHBhZ2UgPT09IDEsXG4gIH0pXG5cbiAgLy8g5bem5YG044Gu44OJ44OD44OI44Gv5b+F6KaB44Gr5b+c44GY44Gm6KGo56S6XG4gIGlmIChkb3RMZWZ0KSB7XG4gICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgdXJsOiAnJyxcbiAgICAgIGxhYmVsOiAnLi4uJyxcbiAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOmAlOS4reOBruODmuODvOOCuFxuICBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxICsgbmVpZ2hib3IgKiAyIH0sIChfLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHBhZ2VOdW1iZXIgPSBpbmRleCArIChwYWdlIC0gbmVpZ2hib3IpXG4gICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgdXJsOiBgJHtiYXNlVXJsfT9wYWdlPSR7cGFnZU51bWJlcn0mP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgICBsYWJlbDogcGFnZU51bWJlcixcbiAgICAgIGFjdGl2ZTogcGFnZSA9PT0gcGFnZU51bWJlcixcbiAgICB9KVxuICB9KVxuXG4gIC8vIOWPs+WBtOOBruODieODg+ODiOOBr+W/heimgeOBq+W/nOOBmOOBpuihqOekulxuICBpZiAoZG90UmlnaHQpIHtcbiAgICBsaW5rQXJyYXkucHVzaCh7XG4gICAgICB1cmw6ICcnLFxuICAgICAgbGFiZWw6ICcuLi4nLFxuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICB9KVxuICB9XG5cbiAgLy8g5pyA5b6M44Gu44Oa44O844K444Gv5b+F44Ga6KGo56S6XG4gIGxpbmtBcnJheS5wdXNoKHtcbiAgICB1cmw6IGxpbmtzLmxhc3QsXG4gICAgbGFiZWw6IHBhZ2VDb3VudCxcbiAgICBhY3RpdmU6IHBhZ2UgPT09IHBhZ2VDb3VudCxcbiAgfSlcblxuICAvLyDpgLLjgoDjg5zjgr/jg7Pjga/lv4XopoHjgavlv5zjgZjjgabooajnpLpcbiAgaWYgKE5leHRMYWJlbCkge1xuICAgIGxpbmtBcnJheS5wdXNoKHtcbiAgICAgIHVybDogbGlua3MubmV4dCxcbiAgICAgIGxhYmVsOiAnTmV4dCcsXG4gICAgICBhY3RpdmU6IGZhbHNlLFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbGlua0FycmF5XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAcHJpc21hL2NsaWVudFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb3JzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidmFsaWRhdG9yXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInpvZFwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9