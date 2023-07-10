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
    const baseUrl = req.baseUrl;
    const links = {
        first: `${baseUrl}/?page=1&?perPage=${perPage}`,
        prev: page === firstPage ? '' : `${baseUrl}/?page=${page - 1}&?perPage=${perPage}`,
        next: page === pageCount ? '' : `${baseUrl}/?page=${page + 1}&?perPage=${perPage}`,
        last: `${baseUrl}/?page=${pageCount}&?perPage=${perPage}`,
    };
    const options = createLinkDefinition(page, pageCount, neighbor);
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
const createLinkDefinition = (page, pageCount, neighbor) => {
    const firstPage = 1;
    const lastPage = pageCount;
    if (page === firstPage) {
        if (lastPage > neighbor * 2 + 3) {
            console.log(`section1-1`);
            return {
                prevLabel: false,
                leftDotLabel: false,
                rightDotLabel: true,
                nextLabel: true,
            };
        }
        else {
            console.log(`section1-2`);
            return {
                prevLabel: false,
                leftDotLabel: false,
                rightDotLabel: false,
                nextLabel: true,
            };
        }
    }
    else if (page === lastPage) {
        if (lastPage > neighbor * 2) {
            console.log(`section2-1`);
            return {
                prevLabel: true,
                leftDotLabel: true,
                rightDotLabel: false,
                nextLabel: false,
            };
        }
        else {
            console.log(`section2-2`);
            return {
                prevLabel: true,
                leftDotLabel: false,
                rightDotLabel: false,
                nextLabel: false,
            };
        }
    }
    else if (lastPage <= neighbor * 2 + 3) {
        console.log(`section3`);
        return {
            prevLabel: true,
            leftDotLabel: false,
            rightDotLabel: false,
            nextLabel: true,
        };
    }
    else if (page - firstPage > neighbor &&
        lastPage - page - 1 > neighbor) {
        console.log(`section4`);
        return {
            prevLabel: true,
            leftDotLabel: true,
            rightDotLabel: true,
            nextLabel: true,
        };
    }
    else if (page - firstPage > neighbor &&
        lastPage - page < neighbor + 1) {
        console.log(`section5`);
        return {
            prevLabel: true,
            leftDotLabel: true,
            rightDotLabel: false,
            nextLabel: true,
        };
    }
    else {
        console.log(`section6`);
        return {
            prevLabel: true,
            leftDotLabel: false,
            rightDotLabel: true,
            nextLabel: true,
        };
    }
};
const createLinkArray = (page, perPage, pageCount, neighbor, options, links, baseUrl) => {
    const { prevLabel, leftDotLabel, rightDotLabel, nextLabel } = options;
    const linkArray = [];
    let id = 1;
    if (prevLabel) {
        linkArray.push({
            id,
            url: links.prev,
            label: 'Prev',
            active: false,
        });
        id++;
    }
    linkArray.push({
        id,
        url: links.first,
        label: '1',
        active: page === 1,
    });
    id++;
    if (leftDotLabel) {
        linkArray.push({
            id,
            url: '',
            label: '...',
            active: false,
        });
        id++;
    }
    if (leftDotLabel && rightDotLabel) {
        console.log(`// 左右にドットが表示される場合`);
        Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
            const pageNumber = index + page - neighbor;
            linkArray.push({
                id,
                url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
                label: pageNumber,
                active: page === pageNumber,
            });
            id++;
        });
    }
    else if (rightDotLabel) {
        console.log(`// 右側にドットが表示される場合`);
        Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
            const pageNumber = index + 2;
            linkArray.push({
                id,
                url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
                label: pageNumber,
                active: page === pageNumber,
            });
            id++;
        });
    }
    else if (leftDotLabel) {
        console.log(`// 左側にドットが表示される場合`);
        Array.from({ length: 1 + neighbor * 2 }, (_, index) => {
            const pageNumber = index + page - neighbor;
            linkArray.push({
                id,
                url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
                label: pageNumber,
                active: page === pageNumber,
            });
            id++;
        });
    }
    else {
        console.log(`// ドットが表示されない場合`);
        Array.from({ length: pageCount - 2 }, (_, index) => {
            const pageNumber = index + page + 1;
            linkArray.push({
                id,
                url: `${baseUrl}?page=${pageNumber}&?perPage=${perPage}`,
                label: pageNumber,
                active: page === pageNumber,
            });
            id++;
        });
    }
    if (rightDotLabel) {
        linkArray.push({
            id,
            url: '',
            label: '...',
            active: false,
        });
        id++;
    }
    linkArray.push({
        id,
        url: links.last,
        label: pageCount,
        active: page === pageCount,
    });
    id++;
    if (nextLabel) {
        linkArray.push({
            id,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLENBQUMsSUFBSTtZQUNmLEtBQUssRUFBRSxNQUFNO1lBQ2IsTUFBTSxFQUFFLEtBQUs7U0FDZCxDQUFDO0tBQ0g7SUFFRCxPQUFPLFNBQVM7QUFDbEIsQ0FBQzs7Ozs7Ozs7Ozs7QUN6UkQ7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9taWRkbGV3YXJlL3ZlcmlmeS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL3VzZXJzLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL2ZpcmViYXNlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL3BhZ2luYXRlLXRlc3QudHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJAcHJpc21hL2NsaWVudFwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiY29yc1wiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzc1wiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwidmFsaWRhdG9yXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJ6b2RcIiIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnXG5cbmltcG9ydCB1c2VyUm91dGVyIGZyb20gJy4vcm91dGVzL3VzZXJzJ1xuaW1wb3J0IGxvZ2luUm91dGVyIGZyb20gJy4vcm91dGVzL2xvZ2luJ1xuXG5jb25zdCBhcHAgPSBleHByZXNzKClcbmFwcC51c2UoY29ycygpKVxuYXBwLnVzZShleHByZXNzLmpzb24oKSlcbmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpXG5cbmNvbnN0IHBvcnQgPSAzMDAwXG5cbmFwcC51c2UoJy9hcGkvdXNlcnMnLCB1c2VyUm91dGVyKVxuYXBwLnVzZSgnL2FwaS9sb2dpbicsIGxvZ2luUm91dGVyKVxuXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYExpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vYClcbn0pXG4iLCJpbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcydcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSBcInNyYy91dGlscy9maXJlYmFzZVwiXG5cbmV4cG9ydCBjb25zdCB2ZXJpZnkgPSBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgY29uc3QgeyBjaGVja0lkVG9rZW4gfSA9IHVzZUZpcmViYXNlKClcbiAgY29uc3QgdXNlciA9IGF3YWl0IGNoZWNrSWRUb2tlbihyZXEpXG5cbiAgaWYgKCF1c2VyLmVycm9yKSB7XG4gICAgcmV0dXJuIG5leHQoKVxuICB9XG5cbiAgcmVzLnNlbmQoe1xuICAgIHN0YXR1c0NvZGU6IHVzZXIuZXJyb3IuY29kZSxcbiAgICBzdGF0dXNNZXNzYWdlOiAnVW5hdXRob3JpemVkJyxcbiAgICBtZXNzYWdlOiB1c2VyLmVycm9yLm1lc3NhZ2UsXG4gIH0pXG59XG4iLCJpbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICd2YWxpZGF0b3InXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmltcG9ydCB7IHZlcmlmeSB9IGZyb20gJy4uL21pZGRsZXdhcmUvdmVyaWZ5J1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5cbi8qKiBQT1NUIC91c2VyL2xvZ2luICovXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB2YWxpZCA9IChcbiAgICBlbWFpbDogYW55LFxuICAgIHBhc3N3b3JkOiBhbnksXG4gICkgPT4ge1xuICAgIGNvbnN0IHJ1bGVFbWFpbCA9ICgpID0+IHZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKVxuICAgIGNvbnN0IHJ1bGVQYXNzd29yZCA9ICgpID0+IHZhbGlkYXRvci5pc1N0cm9uZ1Bhc3N3b3JkKHBhc3N3b3JkLCB7IG1pbkxlbmd0aDogNiB9KVxuXG4gICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IFtcbiAgICAgIHJ1bGVFbWFpbCgpLFxuICAgICAgcnVsZVBhc3N3b3JkKCksXG4gICAgXS5ldmVyeShyZXN1bHQgPT4gcmVzdWx0ID09PSB0cnVlKVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbiAgfVxuXG4gIGNvbnN0IGxvZ2luID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgbG9naW5gKVxuICAgIGNvbnN0IHsgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKVxuXG4gICAgcmV0dXJuIHVzZXJcbiAgfVxuXG4gIGNvbnN0IG9uRmFpbHVyZUxvZ2luID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgb25GYWlsdXJlTG9naW5gKVxuICAgIGNvbnN0IHsgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH0gPSBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9XG4gIH1cblxuICBjb25zdCBib2R5ID0gcmVxLmJvZHlcbiAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQgfSA9IGJvZHlcblxuICAvLyDjg6rjgq/jgqjjgrnjg4jjg5zjg4fjgqPjgafmuKHjgZXjgozjgZ9KU09O44OH44O844K/44GM5LiN5q2j44Gq5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGlmICghZW1haWwgfHwgIXBhc3N3b3JkKSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlcXVlc3QgYm9keScsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODkOODquODh+ODvOOCt+ODp+ODs+OCkuihjOOBhOOAgTHjgaTjgafjgoLkuI3lkIjmoLzjga7loLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OCkuippuOBv+OCi1xuICBjb25zdCB1c2VyID0gYXdhaXQgbG9naW4oZW1haWwsIHBhc3N3b3JkKVxuICBpZiAodXNlci5lcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgajjg6Hjg4Pjgrvjg7zjgrjjgpLlkKvjgoBKU09O44OH44O844K/44KS6L+U44GZXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH0gPSBvbkZhaWx1cmVMb2dpbih1c2VyLmVycm9yKVxuICAgIHJlc1xuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGUsXG4gICAgICBzdGF0dXNNZXNzYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICB9KVxuICB9XG5cbiAgLy8g44Ot44Kw44Kk44Oz44Gr5oiQ5Yqf44GX44Gf44KJ44Kv44OD44Kt44O844KS5L+d5a2Y44GZ44KLXG4gIGNvbnN0IHRpbWUgPSA2MCAqIDYwICogMTAwMFxuICBjb25zdCBleHBpcmVzID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIHRpbWUpXG5cbiAgcmVzLmNvb2tpZSgndG9rZW4nLCB1c2VyLmlkVG9rZW4sIHtcbiAgICBleHBpcmVzOiBleHBpcmVzLFxuICAgIC8vIGh0dHBPbmx5OiB0cnVlLFxuICAgIC8vIHNlY3VyZTogdHJ1ZSxcbiAgfSlcblxuICByZXNcbiAgLnNlbmQoe1xuICAgIHVpZDogdXNlci5sb2NhbElkLFxuICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICB9KVxufSlcblxuLyoqIERFTEVURSAvdXNlci9sb2dpbiAqL1xucm91dGVyLmRlbGV0ZSgnLycsIHZlcmlmeSwgYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuICB0cnkge1xuICAgIHJlc1xuICAgIC5jbGVhckNvb2tpZSgndG9rZW4nKVxuICAgIC5zZW5kKHt9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlcy5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxuICAgICAgbWVzc2FnZTogJ1VuZXhwZWN0ZWQgZXJyb3InLFxuICAgIH0pXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCcgLy/jgZ/jgoHjgZfjgavkvb/jgaPjgabjgb/jgotcbmltcG9ydCB7IHVzZUZpcmViYXNlIH0gZnJvbSAnc3JjL3V0aWxzL2ZpcmViYXNlJ1xuaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5pbXBvcnQgeyB2ZXJpZnkgfSBmcm9tICcuLi9taWRkbGV3YXJlL3ZlcmlmeSdcbi8vIGltcG9ydCB7IHBhZ2luYXRlIH0gZnJvbSAnc3JjL3V0aWxzL3BhZ2luYXRlJ1xuaW1wb3J0IHsgcGFnaW5hdGUgfSBmcm9tICdzcmMvdXRpbHMvcGFnaW5hdGUtdGVzdCdcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpXG5cbi8qKiBQT1NUIC9hcGkvdXNlcnMgKi9cbnJvdXRlci5wb3N0KCcvJywgdmVyaWZ5LCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICAgIGRpc3BsYXlOYW1lOiBhbnksXG4gICAgdGVuYW50SWQ6IGFueSxcbiAgKSA9PiB7XG4gICAgY29uc3QgcnVsZUVtYWlsID0gKCkgPT4gdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpXG4gICAgY29uc3QgcnVsZVBhc3N3b3JkID0gKCkgPT4gdmFsaWRhdG9yLmlzU3Ryb25nUGFzc3dvcmQocGFzc3dvcmQsIHsgbWluTGVuZ3RoOiA2IH0pXG4gICAgY29uc3QgcnVsZURpc3BsYXlOYW1lID0gKCkgPT4ge1xuICAgICAgY29uc3QgaXNTb21lVGV4dCA9IFtcbiAgICAgICAgdmFsaWRhdG9yLmlzQXNjaWkoZGlzcGxheU5hbWUpLFxuICAgICAgICB2YWxpZGF0b3IuaXNNdWx0aWJ5dGUoZGlzcGxheU5hbWUpLFxuICAgICAgXS5zb21lKHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBbXG4gICAgICAgIGlzU29tZVRleHQsXG4gICAgICAgIHZhbGlkYXRvci5pc0xlbmd0aChkaXNwbGF5TmFtZSwgeyBtaW46IDEsIG1heDogMzIgfSksXG4gICAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICAgIHJldHVybiBpc1ZhbGlkXG4gICAgfVxuICAgIGNvbnN0IHJ1bGVUZW5hbnRJZCA9ICgpID0+IHZhbGlkYXRvci5pc0ludCh0ZW5hbnRJZClcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgICAgcnVsZURpc3BsYXlOYW1lKCksXG4gICAgICBydWxlVGVuYW50SWQoKSxcbiAgICBdLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQgPT09IHRydWUpXG5cbiAgICByZXR1cm4gdmFsaWRhdGlvblJlc3VsdFxuICB9XG5cbiAgY29uc3QgY3JlYXRlVXNlclRvRmlyZWJhc2UgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBjcmVhdGVVc2VyVG9GaXJlYmFzZWApXG4gICAgY29uc3QgeyBzaWduVXAgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgc2lnblVwKGVtYWlsLCBwYXNzd29yZClcbiAgICByZXR1cm4gdXNlclxuICB9XG5cbiAgY29uc3Qgb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UgPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZWApXG4gICAgY29uc3QgeyBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcbiAgICBjb25zdCB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UgfSA9IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UobWVzc2FnZSlcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH1cbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZVVzZXJUb0RhdGFiYXNlID0gYXN5bmMgKFxuICAgIHVpZDogc3RyaW5nLFxuICAgIGVtYWlsOiBzdHJpbmcsXG4gICAgZGlzcGxheU5hbWU6IHN0cmluZyxcbiAgICB0ZW5hbnRJZDogc3RyaW5nLFxuICAgICkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBjcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IHByaXNtYS5wcm9maWxlLmNyZWF0ZSh7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHVpZCxcbiAgICAgICAgZW1haWwsXG4gICAgICAgIGRpc3BsYXlOYW1lLFxuICAgICAgICB0ZW5hbnRJZDogcGFyc2VJbnQodGVuYW50SWQpLFxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByb2ZpbGUpXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2VgKVxuICAgIGNvbnN0IHsgZGVsZXRlVXNlciB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGF3YWl0IGRlbGV0ZVVzZXIoaWRUb2tlbilcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keVxuICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhZGlzcGxheU5hbWUgfHwgIXRlbmFudElkKSB7XG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHJlcXVlc3QgYm9keScsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODkOODquODh+ODvOOCt+ODp+ODs+OCkuihjOOBhOOAgTHjgaTjgafjgoLkuI3lkIjmoLzjga7loLTlkIjjga/kvovlpJbjgpLjgrnjg63jg7zjgZnjgotcbiAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkKGVtYWlsLCBwYXNzd29yZCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICBpZiAoIXZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICB9XG5cbiAgLy8gRmlyZWJhc2Xjgbjjg6bjg7zjgrbnmbvpjLLjgZnjgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGNyZWF0ZVVzZXJUb0ZpcmViYXNlKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlQ3JlYXRlVXNlclRvRmlyZWJhc2UodXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc3RhdHVzKHN0YXR1c0NvZGUpXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZSxcbiAgICAgIHN0YXR1c01lc3NhZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg4fjg7zjgr/jg5njg7zjgrnjgbjjg5fjg63jg5XjgqPjg7zjg6vmg4XloLHjgpLnmbvpjLLjgZnjgotcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgY3JlYXRlVXNlclRvRGF0YWJhc2UodXNlci5sb2NhbElkLCBlbWFpbCwgZGlzcGxheU5hbWUsIHRlbmFudElkKVxuICAgIHJlcy5zZW5kKHByb2ZpbGUpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8g5aSx5pWX44GX44Gf44KJRmlyZWJhc2XjgYvjgonjg4fjg7zjgr/jgpLliYrpmaTjgZfjgaZIVFRQ44K544OG44O844K/44K544Kz44O844OJ44KS6L+U44GZXG4gICAgYXdhaXQgb25GYWlsdXJlQ3JlYXRlVXNlclRvRGF0YWJhc2UodXNlci5pZFRva2VuKVxuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnQ3JlYXRlIHRvIGRhdGFiYXNlIGZhaWxlZCcsXG4gICAgfSlcbiAgfVxufSlcblxuLyoqIEdFVCAvYXBpL3VzZXJzICovXG4vLyByb3V0ZXIuZ2V0KCcvJywgdmVyaWZ5LCBhc3luYyAocmVxLCByZXMpID0+IHtcbnJvdXRlci5nZXQoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgeyBwYWdlLCBwZXJQYWdlIH0gPSByZXEucXVlcnlcblxuICBjb25zdCBydWxlUGFnZSA9IHouY29lcmNlLm51bWJlcigpLmludCgpLm1pbigxKVxuICBjb25zdCBydWxlUGVyUGFnZSA9IHouY29lcmNlLm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMTAwKVxuXG4gIGlmIChcbiAgICBydWxlUGFnZS5zYWZlUGFyc2UocGFnZSkuc3VjY2VzcyA9PT0gZmFsc2UgfHxcbiAgICBydWxlUGVyUGFnZS5zYWZlUGFyc2UocGVyUGFnZSkuc3VjY2VzcyA9PT0gZmFsc2VcbiAgKSB7XG4gICAgcmVzLnN0YXR1cyg0MjIpXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDIyLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ1VucHJvY2Vzc2FibGUgRW50aXR5JyxcbiAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IHVzZXJzID0gYXdhaXQgcGFnaW5hdGUocmVxLHtcbiAgICBwYWdlOiBydWxlUGFnZS5wYXJzZShwYWdlKSxcbiAgICBwZXJQYWdlOiBydWxlUGVyUGFnZS5wYXJzZShwZXJQYWdlKSxcbiAgICBxdWVyeUZuOiAoYXJncykgPT5cbiAgICAgIHByaXNtYS5wcm9maWxlLmZpbmRNYW55KHsgLi4uYXJncyB9KSxcbiAgICBjb3VudEZuOiAoKSA9PiBwcmlzbWEucHJvZmlsZS5jb3VudCgpXG4gIH0pXG5cbiAgcmVzXG4gIC5zdGF0dXMoMjAwKVxuICAuc2VuZCh1c2Vycylcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclxuIiwiaW1wb3J0IHsgUmVxdWVzdCB9IGZyb20gJ2V4cHJlc3MnXG5cbmV4cG9ydCBjb25zdCB1c2VGaXJlYmFzZSA9ICgpID0+IHtcbiAgY29uc3QgYXBpS2V5ID0gJ0FJemFTeURJcmFIa3VGV1lkSXRXRXlkY2UxZGJhQXdCc1JOTk1lQSdcbiAgY29uc3QgYmFzZVVybCA9IGBodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS92MWBcblxuICBjb25zdCBzaWduVXAgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOnNpZ25VcGBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGVtYWlsLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICByZXR1cm5TZWN1cmVUb2tlbjogdHJ1ZSxcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IGRlbGV0ZVVzZXIgPSBhc3luYyAoaWRUb2tlbjogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6ZGVsZXRlYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgaWRUb2tlblxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3Qgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOnNpZ25JbldpdGhQYXNzd29yZGBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgYm9keSA9IHtcbiAgICAgIGVtYWlsLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICByZXR1cm5TZWN1cmVUb2tlbjogdHJ1ZSxcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgfVxuXG4gIGNvbnN0IGNoZWNrSWRUb2tlbiA9IGFzeW5jIChyZXE6IFJlcXVlc3QpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpsb29rdXBgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGlkVG9rZW4gPSByZXEuaGVhZGVycy5hdXRob3JpemF0aW9uXG4gICAgY29uc3QgYm9keSA9IHsgaWRUb2tlbiB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCx7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgfSlcblxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICByZXR1cm4gdXNlclxuICB9XG5cbiAgY29uc3QgZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZSA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgc3RhdHVzQ29kZVxuICAgIGxldCBzdGF0dXNNZXNzYWdlXG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgIGNhc2UgJ0lOVkFMSURfUEFTU1dPUkQnOlxuICAgICAgY2FzZSAnRU1BSUxfTk9UX0ZPVU5EJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQwMVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ1VuYXV0aG9yaXplZCdcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnT1BFUkFUSU9OX05PVF9BTExPV0VEJzpcbiAgICAgIGNhc2UgJ1VTRVJfRElTQUJMRUQnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDAzXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnRm9yYmlkZGVuJ1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdFTUFJTF9FWElTVFMnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDA5XG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnQ29uZmxpY3QnXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ1RPT19NQU5ZX0FUVEVNUFRTX1RSWV9MQVRFUic6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MjlcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdUb28gTWFueSBSZXF1ZXN0cydcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDUwMFxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ0ludGVybmFsIFNlcnZlciBFcnJvcidcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNpZ25VcCxcbiAgICBkZWxldGVVc2VyLFxuICAgIHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkLFxuICAgIGNoZWNrSWRUb2tlbixcbiAgICBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlLFxuICB9XG59XG4iLCJpbXBvcnQgeyBSZXF1ZXN0IH0gZnJvbSAnZXhwcmVzcydcblxuLyoqXG4gKiBQcmlzbWHjgafjg5rjg7zjgrjjg43jg7zjgrfjg6fjg7PjgpLlrp/oo4XjgZnjgovvvIhDbGllbnQgZXh0ZW5zaW9uc+OCguS9v+OBo+OBpuOBv+OCi++8iVxuICogaHR0cHM6Ly96ZW5uLmRldi9naWJqYXBhbi9hcnRpY2xlcy84MTVjMGE2NzgzZDVmZlxuICovXG50eXBlIFBhZ2luYXRlSW5wdXRzPEl0ZW1zPiA9IHtcbiAgcGFnZTogbnVtYmVyXG4gIHBlclBhZ2U6IG51bWJlclxuICBxdWVyeUZuOiAoYXJnczogeyBza2lwOiBudW1iZXI7IHRha2U6IG51bWJlciB9KSA9PiBQcm9taXNlPEl0ZW1zPlxuICBjb3VudEZuOiAoKSA9PiBQcm9taXNlPG51bWJlcj5cbn1cblxudHlwZSBQYWdpbmF0ZU91dHB1dHM8SXRlbXM+ID0ge1xuICBpdGVtczogSXRlbXNcbiAgY291bnQ6IG51bWJlclxuICBwYWdlQ291bnQ6IG51bWJlclxuICBsaW5rczogYW55LFxuICBtZXRhOiBhbnlcbn1cblxudHlwZSBMaW5rRGVmaW5pdGlvbiA9IHtcbiAgcHJldkxhYmVsOiBib29sZWFuXG4gIGxlZnREb3RMYWJlbDogYm9vbGVhblxuICByaWdodERvdExhYmVsOiBib29sZWFuXG4gIG5leHRMYWJlbDogYm9vbGVhblxufVxuXG4vKipcbiAqIOODmuODvOOCuOODjeODvOOCt+ODp+ODs+OBleOCjOOBn+ODh+ODvOOCv+OCkuWPluW+l+OBmeOCi1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFnaW5hdGU8SXRlbXM+KHJlcTogUmVxdWVzdCwge1xuICBwYWdlLFxuICBwZXJQYWdlLFxuICBjb3VudEZuLFxuICBxdWVyeUZuLFxufTogUGFnaW5hdGVJbnB1dHM8SXRlbXM+KTogUHJvbWlzZTxQYWdpbmF0ZU91dHB1dHM8SXRlbXM+PiB7XG4gIGNvbnN0IFtpdGVtcywgY291bnRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIHF1ZXJ5Rm4oe1xuICAgICAgc2tpcDogcGVyUGFnZSAqIChwYWdlIC0gMSksXG4gICAgICB0YWtlOiBwZXJQYWdlLFxuICAgIH0pLFxuICAgIGNvdW50Rm4oKSxcbiAgXSlcblxuICBjb25zdCBwYWdlQ291bnQgPSBNYXRoLmNlaWwoY291bnQgLyBwZXJQYWdlKVxuICBjb25zdCBmaXJzdFBhZ2UgPSAxXG4gIGNvbnN0IG5laWdoYm9yID0gMlxuXG4gIGNvbnN0IGJhc2VVcmwgPSByZXEuYmFzZVVybFxuXG4gIGNvbnN0IGxpbmtzID0ge1xuICAgIGZpcnN0OiBgJHtiYXNlVXJsfS8/cGFnZT0xJj9wZXJQYWdlPSR7cGVyUGFnZX1gLFxuICAgIHByZXY6IHBhZ2UgPT09IGZpcnN0UGFnZSA/ICcnIDogYCR7YmFzZVVybH0vP3BhZ2U9JHtwYWdlIC0gMX0mP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgbmV4dDogcGFnZSA9PT0gcGFnZUNvdW50ID8gJycgOiBgJHtiYXNlVXJsfS8/cGFnZT0ke3BhZ2UgKyAxfSY/cGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgICBsYXN0OiBgJHtiYXNlVXJsfS8/cGFnZT0ke3BhZ2VDb3VudH0mP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gIH1cblxuICAvLyDjg5rjg7zjgrjjg43jg7zjgrfjg6fjg7PnlKjjg6rjg7Pjgq/jga7phY3liJflrprnvqko44Kq44OW44K444Kn44Kv44OIKeOCkuadoeS7tuWIhuWykOOBq+W+k+OBo+OBpueUn+aIkOOBmeOCi1xuICBjb25zdCBvcHRpb25zID0gY3JlYXRlTGlua0RlZmluaXRpb24ocGFnZSwgcGFnZUNvdW50LCBuZWlnaGJvcilcbiAgY29uc3QgbWV0YUxpbmtzID0gY3JlYXRlTGlua0FycmF5KHBhZ2UsIHBlclBhZ2UsIHBhZ2VDb3VudCwgbmVpZ2hib3IsIG9wdGlvbnMsIGxpbmtzLCBiYXNlVXJsKVxuXG4gIHJldHVybiB7XG4gICAgaXRlbXMsXG4gICAgY291bnQsXG4gICAgcGFnZUNvdW50LFxuICAgIGxpbmtzLFxuICAgIG1ldGE6IHsgbGlua3M6IG1ldGFMaW5rcyB9LFxuICB9XG59XG5cbmNvbnN0IGNyZWF0ZUxpbmtEZWZpbml0aW9uID0gKHBhZ2U6IG51bWJlciwgcGFnZUNvdW50OiBudW1iZXIsIG5laWdoYm9yOiBudW1iZXIpID0+IHtcbiAgY29uc3QgZmlyc3RQYWdlID0gMVxuICBjb25zdCBsYXN0UGFnZSA9IHBhZ2VDb3VudFxuXG4gIGlmIChwYWdlID09PSBmaXJzdFBhZ2UpIHtcbiAgICBpZiAobGFzdFBhZ2UgPiBuZWlnaGJvciAqIDIgKyAzKSB7XG4gICAgICBjb25zb2xlLmxvZyhgc2VjdGlvbjEtMWApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcmV2TGFiZWw6IGZhbHNlLFxuICAgICAgICBsZWZ0RG90TGFiZWw6IGZhbHNlLFxuICAgICAgICByaWdodERvdExhYmVsOiB0cnVlLFxuICAgICAgICBuZXh0TGFiZWw6IHRydWUsXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGBzZWN0aW9uMS0yYClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByZXZMYWJlbDogZmFsc2UsXG4gICAgICAgIGxlZnREb3RMYWJlbDogZmFsc2UsXG4gICAgICAgIHJpZ2h0RG90TGFiZWw6IGZhbHNlLFxuICAgICAgICBuZXh0TGFiZWw6IHRydWUsXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT09IGxhc3RQYWdlKSB7XG4gICAgaWYgKGxhc3RQYWdlID4gbmVpZ2hib3IgKiAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhgc2VjdGlvbjItMWApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcmV2TGFiZWw6IHRydWUsXG4gICAgICAgIGxlZnREb3RMYWJlbDogdHJ1ZSxcbiAgICAgICAgcmlnaHREb3RMYWJlbDogZmFsc2UsXG4gICAgICAgIG5leHRMYWJlbDogZmFsc2UsXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGBzZWN0aW9uMi0yYClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByZXZMYWJlbDogdHJ1ZSxcbiAgICAgICAgbGVmdERvdExhYmVsOiBmYWxzZSxcbiAgICAgICAgcmlnaHREb3RMYWJlbDogZmFsc2UsXG4gICAgICAgIG5leHRMYWJlbDogZmFsc2UsXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGxhc3RQYWdlIDw9IG5laWdoYm9yICogMiArIDMpIHtcbiAgICBjb25zb2xlLmxvZyhgc2VjdGlvbjNgKVxuICAgIHJldHVybiB7XG4gICAgICBwcmV2TGFiZWw6IHRydWUsXG4gICAgICBsZWZ0RG90TGFiZWw6IGZhbHNlLFxuICAgICAgcmlnaHREb3RMYWJlbDogZmFsc2UsXG4gICAgICBuZXh0TGFiZWw6IHRydWUsXG4gICAgfVxuICB9IGVsc2UgaWYgKFxuICAgIHBhZ2UgLSBmaXJzdFBhZ2UgPiBuZWlnaGJvciAmJlxuICAgIGxhc3RQYWdlIC0gcGFnZSAtIDEgPiBuZWlnaGJvclxuICAgICkge1xuICAgIGNvbnNvbGUubG9nKGBzZWN0aW9uNGApXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZMYWJlbDogdHJ1ZSxcbiAgICAgIGxlZnREb3RMYWJlbDogdHJ1ZSxcbiAgICAgIHJpZ2h0RG90TGFiZWw6IHRydWUsXG4gICAgICBuZXh0TGFiZWw6IHRydWUsXG4gICAgfVxuICB9IGVsc2UgaWYgKFxuICAgIHBhZ2UgLSBmaXJzdFBhZ2UgPiBuZWlnaGJvciAmJlxuICAgIGxhc3RQYWdlIC0gcGFnZSA8IG5laWdoYm9yICsgMVxuICAgICkge1xuICAgIGNvbnNvbGUubG9nKGBzZWN0aW9uNWApXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZMYWJlbDogdHJ1ZSxcbiAgICAgIGxlZnREb3RMYWJlbDogdHJ1ZSxcbiAgICAgIHJpZ2h0RG90TGFiZWw6IGZhbHNlLFxuICAgICAgbmV4dExhYmVsOiB0cnVlLFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhgc2VjdGlvbjZgKVxuICAgIHJldHVybiB7XG4gICAgICBwcmV2TGFiZWw6IHRydWUsXG4gICAgICBsZWZ0RG90TGFiZWw6IGZhbHNlLFxuICAgICAgcmlnaHREb3RMYWJlbDogdHJ1ZSxcbiAgICAgIG5leHRMYWJlbDogdHJ1ZSxcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgY3JlYXRlTGlua0FycmF5ID0gKFxuICBwYWdlOiBudW1iZXIsXG4gIHBlclBhZ2U6IG51bWJlcixcbiAgcGFnZUNvdW50OiBudW1iZXIsXG4gIG5laWdoYm9yOiBudW1iZXIsXG4gIG9wdGlvbnM6IExpbmtEZWZpbml0aW9uLFxuICBsaW5rczogYW55LFxuICBiYXNlVXJsOiBzdHJpbmdcbikgPT4ge1xuICBjb25zdCB7IHByZXZMYWJlbCwgbGVmdERvdExhYmVsLCByaWdodERvdExhYmVsLCBuZXh0TGFiZWwgfSA9IG9wdGlvbnNcbiAgY29uc3QgbGlua0FycmF5ID0gW11cbiAgbGV0IGlkID0gMVxuXG4gIC8vIOaIu+OCi+ODnOOCv+ODs+OBr+W/heimgeOBq+W/nOOBmOOBpuihqOekulxuICBpZiAocHJldkxhYmVsKSB7XG4gICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgaWQsXG4gICAgICB1cmw6IGxpbmtzLnByZXYsXG4gICAgICBsYWJlbDogJ1ByZXYnLFxuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICB9KVxuICAgIGlkKytcbiAgfVxuXG4gIC8vIOacgOWIneOBruODmuODvOOCuOOBr+W/heOBmuihqOekulxuICBsaW5rQXJyYXkucHVzaCh7XG4gICAgaWQsXG4gICAgdXJsOiBsaW5rcy5maXJzdCxcbiAgICBsYWJlbDogJzEnLFxuICAgIGFjdGl2ZTogcGFnZSA9PT0gMSxcbiAgfSlcbiAgaWQrK1xuXG4gIC8vIOW3puWBtOOBruODieODg+ODiOOBr+W/heimgeOBq+W/nOOBmOOBpuihqOekulxuICBpZiAobGVmdERvdExhYmVsKSB7XG4gICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgaWQsXG4gICAgICB1cmw6ICcnLFxuICAgICAgbGFiZWw6ICcuLi4nLFxuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICB9KVxuICAgIGlkKytcbiAgfVxuXG4gIGlmIChsZWZ0RG90TGFiZWwgJiYgcmlnaHREb3RMYWJlbCkge1xuICAgIGNvbnNvbGUubG9nKGAvLyDlt6blj7Pjgavjg4njg4Pjg4jjgYzooajnpLrjgZXjgozjgovloLTlkIhgKVxuICAgIC8vIOW3puWPs+OBq+ODieODg+ODiOOBjOihqOekuuOBleOCjOOCi+WgtOWQiCAo44Or44O844OXPTUpXG4gICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogMSArIG5laWdoYm9yICogMiB9LCAoXywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VOdW1iZXIgPSBpbmRleCArIHBhZ2UgLSBuZWlnaGJvclxuICAgICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgICBpZCxcbiAgICAgICAgdXJsOiBgJHtiYXNlVXJsfT9wYWdlPSR7cGFnZU51bWJlcn0mP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgICAgIGxhYmVsOiBwYWdlTnVtYmVyLFxuICAgICAgICBhY3RpdmU6IHBhZ2UgPT09IHBhZ2VOdW1iZXIsXG4gICAgICB9KVxuICAgICAgaWQrK1xuICAgIH0pXG4gIH0gZWxzZSBpZiAocmlnaHREb3RMYWJlbCkge1xuICAgIGNvbnNvbGUubG9nKGAvLyDlj7PlgbTjgavjg4njg4Pjg4jjgYzooajnpLrjgZXjgozjgovloLTlkIhgKVxuICAgIC8vIOWPs+WBtOOBq+ODieODg+ODiOOBjOihqOekuuOBleOCjOOCi+WgtOWQiCAo44Or44O844OXPTUpXG4gICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogMSArIG5laWdoYm9yICogMiB9LCAoXywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VOdW1iZXIgPSBpbmRleCArIDJcbiAgICAgIGxpbmtBcnJheS5wdXNoKHtcbiAgICAgICAgaWQsXG4gICAgICAgIHVybDogYCR7YmFzZVVybH0/cGFnZT0ke3BhZ2VOdW1iZXJ9Jj9wZXJQYWdlPSR7cGVyUGFnZX1gLFxuICAgICAgICBsYWJlbDogcGFnZU51bWJlcixcbiAgICAgICAgYWN0aXZlOiBwYWdlID09PSBwYWdlTnVtYmVyLFxuICAgICAgfSlcbiAgICAgIGlkKytcbiAgICB9KVxuICB9IGVsc2UgaWYgKGxlZnREb3RMYWJlbCkge1xuICAgIGNvbnNvbGUubG9nKGAvLyDlt6blgbTjgavjg4njg4Pjg4jjgYzooajnpLrjgZXjgozjgovloLTlkIhgKVxuICAgIC8vIOW3puWBtOOBq+ODieODg+ODiOOBjOihqOekuuOBleOCjOOCi+WgtOWQiCAo44Or44O844OXPTUpXG4gICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogMSArIG5laWdoYm9yICogMiB9LCAoXywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBhZ2VOdW1iZXIgPSBpbmRleCArIHBhZ2UgLSBuZWlnaGJvclxuICAgICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgICBpZCxcbiAgICAgICAgdXJsOiBgJHtiYXNlVXJsfT9wYWdlPSR7cGFnZU51bWJlcn0mP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgICAgIGxhYmVsOiBwYWdlTnVtYmVyLFxuICAgICAgICBhY3RpdmU6IHBhZ2UgPT09IHBhZ2VOdW1iZXIsXG4gICAgICB9KVxuICAgICAgaWQrK1xuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coYC8vIOODieODg+ODiOOBjOihqOekuuOBleOCjOOBquOBhOWgtOWQiGApXG4gICAgLy8g44OJ44OD44OI44GM6KGo56S644GV44KM44Gq44GE5aC05ZCIICjjg6vjg7zjg5c9MX41KVxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IHBhZ2VDb3VudCAtIDIgfSwgKF8sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBwYWdlTnVtYmVyID0gaW5kZXggKyBwYWdlICsgMVxuICAgICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgICBpZCxcbiAgICAgICAgdXJsOiBgJHtiYXNlVXJsfT9wYWdlPSR7cGFnZU51bWJlcn0mP3BlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgICAgIGxhYmVsOiBwYWdlTnVtYmVyLFxuICAgICAgICBhY3RpdmU6IHBhZ2UgPT09IHBhZ2VOdW1iZXIsXG4gICAgICB9KVxuICAgICAgaWQrK1xuICAgIH0pXG4gIH1cblxuICAvLyDlj7PlgbTjga7jg4njg4Pjg4jjga/lv4XopoHjgavlv5zjgZjjgabooajnpLpcbiAgaWYgKHJpZ2h0RG90TGFiZWwpIHtcbiAgICBsaW5rQXJyYXkucHVzaCh7XG4gICAgICBpZCxcbiAgICAgIHVybDogJycsXG4gICAgICBsYWJlbDogJy4uLicsXG4gICAgICBhY3RpdmU6IGZhbHNlLFxuICAgIH0pXG4gICAgaWQrK1xuICB9XG5cbiAgLy8g5pyA5b6M44Gu44Oa44O844K444Gv5b+F44Ga6KGo56S6XG4gIGxpbmtBcnJheS5wdXNoKHtcbiAgICBpZCxcbiAgICB1cmw6IGxpbmtzLmxhc3QsXG4gICAgbGFiZWw6IHBhZ2VDb3VudCxcbiAgICBhY3RpdmU6IHBhZ2UgPT09IHBhZ2VDb3VudCxcbiAgfSlcbiAgaWQrK1xuXG4gIC8vIOmAsuOCgOODnOOCv+ODs+OBr+W/heimgeOBq+W/nOOBmOOBpuihqOekulxuICBpZiAobmV4dExhYmVsKSB7XG4gICAgbGlua0FycmF5LnB1c2goe1xuICAgICAgaWQsXG4gICAgICB1cmw6IGxpbmtzLm5leHQsXG4gICAgICBsYWJlbDogJ05leHQnLFxuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIGxpbmtBcnJheVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZhbGlkYXRvclwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ6b2RcIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==