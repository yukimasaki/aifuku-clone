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
const zod_1 = __webpack_require__(/*! zod */ "./node_modules/zod/lib/index.js");
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
exports.createPageLabels = exports.paginate = void 0;
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
    return {
        items,
        count,
        pageCount,
        links,
    };
};
exports.paginate = paginate;
const createPageLabels = (pageInfo) => {
    const checkPageContinuty = (pageInfo) => {
        const { page, pageCount, pageRange } = pageInfo;
        return {
            left: page - pageRange - 1 <= 1,
            right: pageCount - page <= pageRange + 1
        };
    };
    const checkPagePosition = (pageInfo) => {
        const { page, pageCount } = pageInfo;
        if (page === 1) {
            return 'start';
        }
        else if (page === pageCount) {
            return 'end';
        }
        else {
            return 'middle';
        }
    };
    const createDotLabel = (description) => {
        return {
            description,
            value: '...',
            url: '',
            active: false,
        };
    };
    const createNavigateBtn = (direction, pageInfo) => {
        return {
            description: direction,
            value: direction,
            url: `${baseUrl}/?page=${direction === 'Prev' ? page - 1 : page + 1}&perPage=${perPage}`,
            active: false,
        };
    };
    const { page, pageCount, pageRange, perPage, baseUrl } = pageInfo;
    const { left, right } = checkPageContinuty(pageInfo);
    const pagePosition = checkPagePosition(pageInfo);
    if (left && right && pagePosition === 'start') {
    }
    else if (left && right && pagePosition === 'middle') {
    }
    else if (left && right && pagePosition === 'end') {
    }
    else if (left && !right && pagePosition === 'start') {
    }
    else if (left && !right && pagePosition === 'middle') {
    }
    else if (!left && right && pagePosition === 'middle') {
    }
    else if (!left && right && pagePosition === 'end') {
    }
    else if (!left && !right && pagePosition === 'middle') {
    }
    else {
        console.log(`想定外の分岐`);
    }
};
exports.createPageLabels = createPageLabels;


/***/ }),

/***/ "./node_modules/zod/lib/ZodError.js":
/*!******************************************!*\
  !*** ./node_modules/zod/lib/ZodError.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZodError = exports.quotelessJson = exports.ZodIssueCode = void 0;
const util_1 = __webpack_require__(/*! ./helpers/util */ "./node_modules/zod/lib/helpers/util.js");
exports.ZodIssueCode = util_1.util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
]);
const quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
exports.quotelessJson = quotelessJson;
class ZodError extends Error {
    constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    get errors() {
        return this.issues;
    }
    format(_mapper) {
        const mapper = _mapper ||
            function (issue) {
                return issue.message;
            };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                }
                else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                }
                else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                }
                else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < issue.path.length) {
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, util_1.util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    get formErrors() {
        return this.flatten();
    }
}
exports.ZodError = ZodError;
ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
};


/***/ }),

/***/ "./node_modules/zod/lib/errors.js":
/*!****************************************!*\
  !*** ./node_modules/zod/lib/errors.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getErrorMap = exports.setErrorMap = exports.defaultErrorMap = void 0;
const en_1 = __importDefault(__webpack_require__(/*! ./locales/en */ "./node_modules/zod/lib/locales/en.js"));
exports.defaultErrorMap = en_1.default;
let overrideErrorMap = en_1.default;
function setErrorMap(map) {
    overrideErrorMap = map;
}
exports.setErrorMap = setErrorMap;
function getErrorMap() {
    return overrideErrorMap;
}
exports.getErrorMap = getErrorMap;


/***/ }),

/***/ "./node_modules/zod/lib/external.js":
/*!******************************************!*\
  !*** ./node_modules/zod/lib/external.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/zod/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./helpers/parseUtil */ "./node_modules/zod/lib/helpers/parseUtil.js"), exports);
__exportStar(__webpack_require__(/*! ./helpers/typeAliases */ "./node_modules/zod/lib/helpers/typeAliases.js"), exports);
__exportStar(__webpack_require__(/*! ./helpers/util */ "./node_modules/zod/lib/helpers/util.js"), exports);
__exportStar(__webpack_require__(/*! ./types */ "./node_modules/zod/lib/types.js"), exports);
__exportStar(__webpack_require__(/*! ./ZodError */ "./node_modules/zod/lib/ZodError.js"), exports);


/***/ }),

/***/ "./node_modules/zod/lib/helpers/errorUtil.js":
/*!***************************************************!*\
  !*** ./node_modules/zod/lib/helpers/errorUtil.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorUtil = void 0;
var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil = exports.errorUtil || (exports.errorUtil = {}));


/***/ }),

/***/ "./node_modules/zod/lib/helpers/parseUtil.js":
/*!***************************************************!*\
  !*** ./node_modules/zod/lib/helpers/parseUtil.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isAsync = exports.isValid = exports.isDirty = exports.isAborted = exports.OK = exports.DIRTY = exports.INVALID = exports.ParseStatus = exports.addIssueToContext = exports.EMPTY_PATH = exports.makeIssue = void 0;
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/zod/lib/errors.js");
const en_1 = __importDefault(__webpack_require__(/*! ../locales/en */ "./node_modules/zod/lib/locales/en.js"));
const makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...(issueData.path || [])];
    const fullIssue = {
        ...issueData,
        path: fullPath,
    };
    let errorMessage = "";
    const maps = errorMaps
        .filter((m) => !!m)
        .slice()
        .reverse();
    for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: issueData.message || errorMessage,
    };
};
exports.makeIssue = makeIssue;
exports.EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
    const issue = (0, exports.makeIssue)({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            (0, errors_1.getErrorMap)(),
            en_1.default,
        ].filter((x) => !!x),
    });
    ctx.common.issues.push(issue);
}
exports.addIssueToContext = addIssueToContext;
class ParseStatus {
    constructor() {
        this.value = "valid";
    }
    dirty() {
        if (this.value === "valid")
            this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted")
            this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
            if (s.status === "aborted")
                return exports.INVALID;
            if (s.status === "dirty")
                status.dirty();
            arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
            syncPairs.push({
                key: await pair.key,
                value: await pair.value,
            });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
            const { key, value } = pair;
            if (key.status === "aborted")
                return exports.INVALID;
            if (value.status === "aborted")
                return exports.INVALID;
            if (key.status === "dirty")
                status.dirty();
            if (value.status === "dirty")
                status.dirty();
            if (typeof value.value !== "undefined" || pair.alwaysSet) {
                finalObject[key.value] = value.value;
            }
        }
        return { status: status.value, value: finalObject };
    }
}
exports.ParseStatus = ParseStatus;
exports.INVALID = Object.freeze({
    status: "aborted",
});
const DIRTY = (value) => ({ status: "dirty", value });
exports.DIRTY = DIRTY;
const OK = (value) => ({ status: "valid", value });
exports.OK = OK;
const isAborted = (x) => x.status === "aborted";
exports.isAborted = isAborted;
const isDirty = (x) => x.status === "dirty";
exports.isDirty = isDirty;
const isValid = (x) => x.status === "valid";
exports.isValid = isValid;
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
exports.isAsync = isAsync;


/***/ }),

/***/ "./node_modules/zod/lib/helpers/typeAliases.js":
/*!*****************************************************!*\
  !*** ./node_modules/zod/lib/helpers/typeAliases.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/zod/lib/helpers/util.js":
/*!**********************************************!*\
  !*** ./node_modules/zod/lib/helpers/util.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getParsedType = exports.ZodParsedType = exports.objectUtil = exports.util = void 0;
var util;
(function (util) {
    util.assertEqual = (val) => val;
    function assertIs(_arg) { }
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj) => {
        const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
            filtered[k] = obj[k];
        }
        return util.objectValues(filtered);
    };
    util.objectValues = (obj) => {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function"
        ? (obj) => Object.keys(obj)
        : (object) => {
            const keys = [];
            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = (arr, checker) => {
        for (const item of arr) {
            if (checker(item))
                return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? (val) => Number.isInteger(val)
        : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array
            .map((val) => (typeof val === "string" ? `'${val}'` : val))
            .join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util = exports.util || (exports.util = {}));
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = (first, second) => {
        return {
            ...first,
            ...second,
        };
    };
})(objectUtil = exports.objectUtil || (exports.objectUtil = {}));
exports.ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return exports.ZodParsedType.undefined;
        case "string":
            return exports.ZodParsedType.string;
        case "number":
            return isNaN(data) ? exports.ZodParsedType.nan : exports.ZodParsedType.number;
        case "boolean":
            return exports.ZodParsedType.boolean;
        case "function":
            return exports.ZodParsedType.function;
        case "bigint":
            return exports.ZodParsedType.bigint;
        case "symbol":
            return exports.ZodParsedType.symbol;
        case "object":
            if (Array.isArray(data)) {
                return exports.ZodParsedType.array;
            }
            if (data === null) {
                return exports.ZodParsedType.null;
            }
            if (data.then &&
                typeof data.then === "function" &&
                data.catch &&
                typeof data.catch === "function") {
                return exports.ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return exports.ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return exports.ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return exports.ZodParsedType.date;
            }
            return exports.ZodParsedType.object;
        default:
            return exports.ZodParsedType.unknown;
    }
};
exports.getParsedType = getParsedType;


/***/ }),

/***/ "./node_modules/zod/lib/index.js":
/*!***************************************!*\
  !*** ./node_modules/zod/lib/index.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.z = void 0;
const z = __importStar(__webpack_require__(/*! ./external */ "./node_modules/zod/lib/external.js"));
exports.z = z;
__exportStar(__webpack_require__(/*! ./external */ "./node_modules/zod/lib/external.js"), exports);
exports["default"] = z;


/***/ }),

/***/ "./node_modules/zod/lib/locales/en.js":
/*!********************************************!*\
  !*** ./node_modules/zod/lib/locales/en.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(/*! ../helpers/util */ "./node_modules/zod/lib/helpers/util.js");
const ZodError_1 = __webpack_require__(/*! ../ZodError */ "./node_modules/zod/lib/ZodError.js");
const errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
        case ZodError_1.ZodIssueCode.invalid_type:
            if (issue.received === util_1.ZodParsedType.undefined) {
                message = "Required";
            }
            else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodError_1.ZodIssueCode.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util_1.util.jsonStringifyReplacer)}`;
            break;
        case ZodError_1.ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${util_1.util.joinValues(issue.keys, ", ")}`;
            break;
        case ZodError_1.ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodError_1.ZodIssueCode.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${util_1.util.joinValues(issue.options)}`;
            break;
        case ZodError_1.ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${util_1.util.joinValues(issue.options)}, received '${issue.received}'`;
            break;
        case ZodError_1.ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodError_1.ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodError_1.ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodError_1.ZodIssueCode.invalid_string:
            if (typeof issue.validation === "object") {
                if ("includes" in issue.validation) {
                    message = `Invalid input: must include "${issue.validation.includes}"`;
                    if (typeof issue.validation.position === "number") {
                        message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                    }
                }
                else if ("startsWith" in issue.validation) {
                    message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                }
                else if ("endsWith" in issue.validation) {
                    message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                }
                else {
                    util_1.util.assertNever(issue.validation);
                }
            }
            else if (issue.validation !== "regex") {
                message = `Invalid ${issue.validation}`;
            }
            else {
                message = "Invalid";
            }
            break;
        case ZodError_1.ZodIssueCode.too_small:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${issue.minimum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${new Date(Number(issue.minimum))}`;
            else
                message = "Invalid input";
            break;
        case ZodError_1.ZodIssueCode.too_big:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint")
                message = `BigInt must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `smaller than or equal to`
                        : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else
                message = "Invalid input";
            break;
        case ZodError_1.ZodIssueCode.custom:
            message = `Invalid input`;
            break;
        case ZodError_1.ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodError_1.ZodIssueCode.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
        case ZodError_1.ZodIssueCode.not_finite:
            message = "Number must be finite";
            break;
        default:
            message = _ctx.defaultError;
            util_1.util.assertNever(issue);
    }
    return { message };
};
exports["default"] = errorMap;


/***/ }),

/***/ "./node_modules/zod/lib/types.js":
/*!***************************************!*\
  !*** ./node_modules/zod/lib/types.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.discriminatedUnion = exports.date = exports.boolean = exports.bigint = exports.array = exports.any = exports.coerce = exports.ZodFirstPartyTypeKind = exports.late = exports.ZodSchema = exports.Schema = exports.custom = exports.ZodPipeline = exports.ZodBranded = exports.BRAND = exports.ZodNaN = exports.ZodCatch = exports.ZodDefault = exports.ZodNullable = exports.ZodOptional = exports.ZodTransformer = exports.ZodEffects = exports.ZodPromise = exports.ZodNativeEnum = exports.ZodEnum = exports.ZodLiteral = exports.ZodLazy = exports.ZodFunction = exports.ZodSet = exports.ZodMap = exports.ZodRecord = exports.ZodTuple = exports.ZodIntersection = exports.ZodDiscriminatedUnion = exports.ZodUnion = exports.ZodObject = exports.ZodArray = exports.ZodVoid = exports.ZodNever = exports.ZodUnknown = exports.ZodAny = exports.ZodNull = exports.ZodUndefined = exports.ZodSymbol = exports.ZodDate = exports.ZodBoolean = exports.ZodBigInt = exports.ZodNumber = exports.ZodString = exports.ZodType = void 0;
exports.NEVER = exports["void"] = exports.unknown = exports.union = exports.undefined = exports.tuple = exports.transformer = exports.symbol = exports.string = exports.strictObject = exports.set = exports.record = exports.promise = exports.preprocess = exports.pipeline = exports.ostring = exports.optional = exports.onumber = exports.oboolean = exports.object = exports.number = exports.nullable = exports["null"] = exports.never = exports.nativeEnum = exports.nan = exports.map = exports.literal = exports.lazy = exports.intersection = exports["instanceof"] = exports["function"] = exports["enum"] = exports.effect = void 0;
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/zod/lib/errors.js");
const errorUtil_1 = __webpack_require__(/*! ./helpers/errorUtil */ "./node_modules/zod/lib/helpers/errorUtil.js");
const parseUtil_1 = __webpack_require__(/*! ./helpers/parseUtil */ "./node_modules/zod/lib/helpers/parseUtil.js");
const util_1 = __webpack_require__(/*! ./helpers/util */ "./node_modules/zod/lib/helpers/util.js");
const ZodError_1 = __webpack_require__(/*! ./ZodError */ "./node_modules/zod/lib/ZodError.js");
class ParseInputLazyPath {
    constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
    }
    get path() {
        if (!this._cachedPath.length) {
            if (this._key instanceof Array) {
                this._cachedPath.push(...this._path, ...this._key);
            }
            else {
                this._cachedPath.push(...this._path, this._key);
            }
        }
        return this._cachedPath;
    }
}
const handleResult = (ctx, result) => {
    if ((0, parseUtil_1.isValid)(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error() {
                if (this._error)
                    return this._error;
                const error = new ZodError_1.ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
function processCreateParams(params) {
    if (!params)
        return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap)
        return { errorMap: errorMap, description };
    const customMap = (iss, ctx) => {
        if (iss.code !== "invalid_type")
            return { message: ctx.defaultError };
        if (typeof ctx.data === "undefined") {
            return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
        }
        return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
    };
    return { errorMap: customMap, description };
}
class ZodType {
    constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
    }
    get description() {
        return this._def.description;
    }
    _getType(input) {
        return (0, util_1.getParsedType)(input.data);
    }
    _getOrReturnCtx(input, ctx) {
        return (ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: (0, util_1.getParsedType)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
        });
    }
    _processInputParams(input) {
        return {
            status: new parseUtil_1.ParseStatus(),
            ctx: {
                common: input.parent.common,
                data: input.data,
                parsedType: (0, util_1.getParsedType)(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent,
            },
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if ((0, parseUtil_1.isAsync)(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        var _a;
        const ctx = {
            common: {
                issues: [],
                async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0, util_1.getParsedType)(data),
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            common: {
                issues: [],
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                async: true,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0, util_1.getParsedType)(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await ((0, parseUtil_1.isAsync)(maybeAsyncResult)
            ? maybeAsyncResult
            : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    refine(check, message) {
        const getIssueProperties = (val) => {
            if (typeof message === "string" || typeof message === "undefined") {
                return { message };
            }
            else if (typeof message === "function") {
                return message(val);
            }
            else {
                return message;
            }
        };
        return this._refinement((val, ctx) => {
            const result = check(val);
            const setError = () => ctx.addIssue({
                code: ZodError_1.ZodIssueCode.custom,
                ...getIssueProperties(val),
            });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then((data) => {
                    if (!data) {
                        setError();
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            }
            else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function"
                    ? refinementData(val, ctx)
                    : refinementData);
                return false;
            }
            else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement },
        });
    }
    superRefine(refinement) {
        return this._refinement(refinement);
    }
    optional() {
        return ZodOptional.create(this, this._def);
    }
    nullable() {
        return ZodNullable.create(this, this._def);
    }
    nullish() {
        return this.nullable().optional();
    }
    array() {
        return ZodArray.create(this, this._def);
    }
    promise() {
        return ZodPromise.create(this, this._def);
    }
    or(option) {
        return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
        return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform },
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
    }
    brand() {
        return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def),
        });
    }
    catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
        });
    }
    describe(description) {
        const This = this.constructor;
        return new This({
            ...this._def,
            description,
        });
    }
    pipe(target) {
        return ZodPipeline.create(this, target);
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
exports.ZodType = ZodType;
exports.Schema = ZodType;
exports.ZodSchema = ZodType;
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[a-z][a-z0-9]*$/;
const ulidRegex = /[0-9A-HJKMNP-TV-Z]{26}/;
const uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u;
const ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
const datetimeRegex = (args) => {
    if (args.precision) {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        }
        else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
        }
    }
    else if (args.precision === 0) {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        }
        else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
        }
    }
    else {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        }
        else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
        }
    }
};
function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
    }
    return false;
}
class ZodString extends ZodType {
    constructor() {
        super(...arguments);
        this._regex = (regex, validation, message) => this.refinement((data) => regex.test(data), {
            validation,
            code: ZodError_1.ZodIssueCode.invalid_string,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
        this.nonempty = (message) => this.min(1, errorUtil_1.errorUtil.errToObj(message));
        this.trim = () => new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "trim" }],
        });
        this.toLowerCase = () => new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toLowerCase" }],
        });
        this.toUpperCase = () => new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toUpperCase" }],
        });
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.string) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.string,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const status = new parseUtil_1.ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.length < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.length > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "length") {
                const tooBig = input.data.length > check.value;
                const tooSmall = input.data.length < check.value;
                if (tooBig || tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    if (tooBig) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    else if (tooSmall) {
                        (0, parseUtil_1.addIssueToContext)(ctx, {
                            code: ZodError_1.ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    status.dirty();
                }
            }
            else if (check.kind === "email") {
                if (!emailRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "email",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "emoji") {
                if (!emojiRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "emoji",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "uuid") {
                if (!uuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "uuid",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid") {
                if (!cuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "cuid",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid2") {
                if (!cuid2Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "cuid2",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ulid") {
                if (!ulidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "ulid",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "url") {
                try {
                    new URL(input.data);
                }
                catch (_a) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "url",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(input.data);
                if (!testResult) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "regex",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "trim") {
                input.data = input.data.trim();
            }
            else if (check.kind === "includes") {
                if (!input.data.includes(check.value, check.position)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        validation: { includes: check.value, position: check.position },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "toLowerCase") {
                input.data = input.data.toLowerCase();
            }
            else if (check.kind === "toUpperCase") {
                input.data = input.data.toUpperCase();
            }
            else if (check.kind === "startsWith") {
                if (!input.data.startsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        validation: { startsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "endsWith") {
                if (!input.data.endsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        validation: { endsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "datetime") {
                const regex = datetimeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        validation: "datetime",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ip") {
                if (!isValidIP(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        validation: "ip",
                        code: ZodError_1.ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util_1.util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    email(message) {
        return this._addCheck({ kind: "email", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    url(message) {
        return this._addCheck({ kind: "url", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil_1.errorUtil.errToObj(message) });
    }
    ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil_1.errorUtil.errToObj(options) });
    }
    datetime(options) {
        var _a;
        if (typeof options === "string") {
            return this._addCheck({
                kind: "datetime",
                precision: null,
                offset: false,
                message: options,
            });
        }
        return this._addCheck({
            kind: "datetime",
            precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
            offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
            ...errorUtil_1.errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
    }
    includes(value, options) {
        return this._addCheck({
            kind: "includes",
            value: value,
            position: options === null || options === void 0 ? void 0 : options.position,
            ...errorUtil_1.errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    startsWith(value, message) {
        return this._addCheck({
            kind: "startsWith",
            value: value,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
    }
    endsWith(value, message) {
        return this._addCheck({
            kind: "endsWith",
            value: value,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
    }
    length(len, message) {
        return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil_1.errorUtil.errToObj(message),
        });
    }
    get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
exports.ZodString = ZodString;
ZodString.create = (params) => {
    var _a;
    return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params),
    });
};
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / Math.pow(10, decCount);
}
class ZodNumber extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.number) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.number,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        let ctx = undefined;
        const status = new parseUtil_1.ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "int") {
                if (!util_1.util.isInteger(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "min") {
                const tooSmall = check.inclusive
                    ? input.data < check.value
                    : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive
                    ? input.data > check.value
                    : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (floatSafeRemainder(input.data, check.value) !== 0) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "finite") {
                if (!Number.isFinite(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.not_finite,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util_1.util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_1.errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_1.errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_1.errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_1.errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil_1.errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    finite(message) {
        return this._addCheck({
            kind: "finite",
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    safe(message) {
        return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil_1.errorUtil.toString(message),
        })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" ||
            (ch.kind === "multipleOf" && util_1.util.isInteger(ch.value)));
    }
    get isFinite() {
        let max = null, min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "finite" ||
                ch.kind === "int" ||
                ch.kind === "multipleOf") {
                return true;
            }
            else if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
            else if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return Number.isFinite(min) && Number.isFinite(max);
    }
}
exports.ZodNumber = ZodNumber;
ZodNumber.create = (params) => {
    return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params),
    });
};
class ZodBigInt extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = BigInt(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.bigint) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.bigint,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        let ctx = undefined;
        const status = new parseUtil_1.ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                const tooSmall = check.inclusive
                    ? input.data < check.value
                    : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_small,
                        type: "bigint",
                        minimum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive
                    ? input.data > check.value
                    : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_big,
                        type: "bigint",
                        maximum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (input.data % check.value !== BigInt(0)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util_1.util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil_1.errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil_1.errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil_1.errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil_1.errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil_1.errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodBigInt({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
exports.ZodBigInt = ZodBigInt;
ZodBigInt.create = (params) => {
    var _a;
    return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params),
    });
};
class ZodBoolean extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.boolean) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.boolean,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodBoolean = ZodBoolean;
ZodBoolean.create = (params) => {
    return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params),
    });
};
class ZodDate extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.date) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.date,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        if (isNaN(input.data.getTime())) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_date,
            });
            return parseUtil_1.INVALID;
        }
        const status = new parseUtil_1.ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.getTime() < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_small,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        minimum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.getTime() > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.too_big,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        maximum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else {
                util_1.util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: new Date(input.data.getTime()),
        };
    }
    _addCheck(check) {
        return new ZodDate({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    min(minDate, message) {
        return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    max(maxDate, message) {
        return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil_1.errorUtil.toString(message),
        });
    }
    get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min != null ? new Date(min) : null;
    }
    get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max != null ? new Date(max) : null;
    }
}
exports.ZodDate = ZodDate;
ZodDate.create = (params) => {
    return new ZodDate({
        checks: [],
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params),
    });
};
class ZodSymbol extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.symbol) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.symbol,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodSymbol = ZodSymbol;
ZodSymbol.create = (params) => {
    return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params),
    });
};
class ZodUndefined extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.undefined,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodUndefined = ZodUndefined;
ZodUndefined.create = (params) => {
    return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params),
    });
};
class ZodNull extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.null) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.null,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodNull = ZodNull;
ZodNull.create = (params) => {
    return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params),
    });
};
class ZodAny extends ZodType {
    constructor() {
        super(...arguments);
        this._any = true;
    }
    _parse(input) {
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodAny = ZodAny;
ZodAny.create = (params) => {
    return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params),
    });
};
class ZodUnknown extends ZodType {
    constructor() {
        super(...arguments);
        this._unknown = true;
    }
    _parse(input) {
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodUnknown = ZodUnknown;
ZodUnknown.create = (params) => {
    return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params),
    });
};
class ZodNever extends ZodType {
    _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        (0, parseUtil_1.addIssueToContext)(ctx, {
            code: ZodError_1.ZodIssueCode.invalid_type,
            expected: util_1.ZodParsedType.never,
            received: ctx.parsedType,
        });
        return parseUtil_1.INVALID;
    }
}
exports.ZodNever = ZodNever;
ZodNever.create = (params) => {
    return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params),
    });
};
class ZodVoid extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.void,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
}
exports.ZodVoid = ZodVoid;
ZodVoid.create = (params) => {
    return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params),
    });
};
class ZodArray extends ZodType {
    _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== util_1.ZodParsedType.array) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.array,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: tooBig ? ZodError_1.ZodIssueCode.too_big : ZodError_1.ZodIssueCode.too_small,
                    minimum: (tooSmall ? def.exactLength.value : undefined),
                    maximum: (tooBig ? def.exactLength.value : undefined),
                    type: "array",
                    inclusive: true,
                    exact: true,
                    message: def.exactLength.message,
                });
                status.dirty();
            }
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.minLength.message,
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.maxLength.message,
                });
                status.dirty();
            }
        }
        if (ctx.common.async) {
            return Promise.all([...ctx.data].map((item, i) => {
                return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            })).then((result) => {
                return parseUtil_1.ParseStatus.mergeArray(status, result);
            });
        }
        const result = [...ctx.data].map((item, i) => {
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return parseUtil_1.ParseStatus.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: { value: minLength, message: errorUtil_1.errorUtil.toString(message) },
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: { value: maxLength, message: errorUtil_1.errorUtil.toString(message) },
        });
    }
    length(len, message) {
        return new ZodArray({
            ...this._def,
            exactLength: { value: len, message: errorUtil_1.errorUtil.toString(message) },
        });
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
exports.ZodArray = ZodArray;
ZodArray.create = (schema, params) => {
    return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params),
    });
};
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: () => newShape,
        });
    }
    else if (schema instanceof ZodArray) {
        return new ZodArray({
            ...schema._def,
            type: deepPartialify(schema.element),
        });
    }
    else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    }
    else {
        return schema;
    }
}
class ZodObject extends ZodType {
    constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
    }
    _getCached() {
        if (this._cached !== null)
            return this._cached;
        const shape = this._def.shape();
        const keys = util_1.util.objectKeys(shape);
        return (this._cached = { shape, keys });
    }
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.object) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever &&
            this._def.unknownKeys === "strip")) {
            for (const key in ctx.data) {
                if (!shapeKeys.includes(key)) {
                    extraKeys.push(key);
                }
            }
        }
        const pairs = [];
        for (const key of shapeKeys) {
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: { status: "valid", value: key },
                value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key of extraKeys) {
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: { status: "valid", value: ctx.data[key] },
                    });
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    (0, parseUtil_1.addIssueToContext)(ctx, {
                        code: ZodError_1.ZodIssueCode.unrecognized_keys,
                        keys: extraKeys,
                    });
                    status.dirty();
                }
            }
            else if (unknownKeys === "strip") {
            }
            else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        }
        else {
            const catchall = this._def.catchall;
            for (const key of extraKeys) {
                const value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                    alwaysSet: key in ctx.data,
                });
            }
        }
        if (ctx.common.async) {
            return Promise.resolve()
                .then(async () => {
                const syncPairs = [];
                for (const pair of pairs) {
                    const key = await pair.key;
                    syncPairs.push({
                        key,
                        value: await pair.value,
                        alwaysSet: pair.alwaysSet,
                    });
                }
                return syncPairs;
            })
                .then((syncPairs) => {
                return parseUtil_1.ParseStatus.mergeObjectSync(status, syncPairs);
            });
        }
        else {
            return parseUtil_1.ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil_1.errorUtil.errToObj;
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...(message !== undefined
                ? {
                    errorMap: (issue, ctx) => {
                        var _a, _b, _c, _d;
                        const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
                        if (issue.code === "unrecognized_keys")
                            return {
                                message: (_d = errorUtil_1.errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError,
                            };
                        return {
                            message: defaultError,
                        };
                    },
                }
                : {}),
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip",
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough",
        });
    }
    extend(augmentation) {
        return new ZodObject({
            ...this._def,
            shape: () => ({
                ...this._def.shape(),
                ...augmentation,
            }),
        });
    }
    merge(merging) {
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: () => ({
                ...this._def.shape(),
                ...merging._def.shape(),
            }),
            typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
    }
    setKey(key, schema) {
        return this.augment({ [key]: schema });
    }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index,
        });
    }
    pick(mask) {
        const shape = {};
        util_1.util.objectKeys(mask).forEach((key) => {
            if (mask[key] && this.shape[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    omit(mask) {
        const shape = {};
        util_1.util.objectKeys(this.shape).forEach((key) => {
            if (!mask[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {};
        util_1.util.objectKeys(this.shape).forEach((key) => {
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
                newShape[key] = fieldSchema;
            }
            else {
                newShape[key] = fieldSchema.optional();
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    required(mask) {
        const newShape = {};
        util_1.util.objectKeys(this.shape).forEach((key) => {
            if (mask && !mask[key]) {
                newShape[key] = this.shape[key];
            }
            else {
                const fieldSchema = this.shape[key];
                let newField = fieldSchema;
                while (newField instanceof ZodOptional) {
                    newField = newField._def.innerType;
                }
                newShape[key] = newField;
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    keyof() {
        return createZodEnum(util_1.util.objectKeys(this.shape));
    }
}
exports.ZodObject = ZodObject;
ZodObject.create = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
class ZodUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            for (const result of results) {
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result of results) {
                if (result.result.status === "dirty") {
                    ctx.common.issues.push(...result.ctx.common.issues);
                    return result.result;
                }
            }
            const unionErrors = results.map((result) => new ZodError_1.ZodError(result.ctx.common.issues));
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_union,
                unionErrors,
            });
            return parseUtil_1.INVALID;
        }
        if (ctx.common.async) {
            return Promise.all(options.map(async (option) => {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    }),
                    ctx: childCtx,
                };
            })).then(handleResults);
        }
        else {
            let dirty = undefined;
            const issues = [];
            for (const option of options) {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                const result = option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: childCtx,
                });
                if (result.status === "valid") {
                    return result;
                }
                else if (result.status === "dirty" && !dirty) {
                    dirty = { result, ctx: childCtx };
                }
                if (childCtx.common.issues.length) {
                    issues.push(childCtx.common.issues);
                }
            }
            if (dirty) {
                ctx.common.issues.push(...dirty.ctx.common.issues);
                return dirty.result;
            }
            const unionErrors = issues.map((issues) => new ZodError_1.ZodError(issues));
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_union,
                unionErrors,
            });
            return parseUtil_1.INVALID;
        }
    }
    get options() {
        return this._def.options;
    }
}
exports.ZodUnion = ZodUnion;
ZodUnion.create = (types, params) => {
    return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params),
    });
};
const getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
    }
    else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
    }
    else if (type instanceof ZodLiteral) {
        return [type.value];
    }
    else if (type instanceof ZodEnum) {
        return type.options;
    }
    else if (type instanceof ZodNativeEnum) {
        return Object.keys(type.enum);
    }
    else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
    }
    else if (type instanceof ZodUndefined) {
        return [undefined];
    }
    else if (type instanceof ZodNull) {
        return [null];
    }
    else {
        return null;
    }
};
class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.object) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_union_discriminator,
                options: Array.from(this.optionsMap.keys()),
                path: [discriminator],
            });
            return parseUtil_1.INVALID;
        }
        if (ctx.common.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
        else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
    }
    get discriminator() {
        return this._def.discriminator;
    }
    get options() {
        return this._def.options;
    }
    get optionsMap() {
        return this._def.optionsMap;
    }
    static create(discriminator, options, params) {
        const optionsMap = new Map();
        for (const type of options) {
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues) {
                throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues) {
                if (optionsMap.has(value)) {
                    throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                }
                optionsMap.set(value, type);
            }
        }
        return new ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params),
        });
    }
}
exports.ZodDiscriminatedUnion = ZodDiscriminatedUnion;
function mergeValues(a, b) {
    const aType = (0, util_1.getParsedType)(a);
    const bType = (0, util_1.getParsedType)(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    else if (aType === util_1.ZodParsedType.object && bType === util_1.ZodParsedType.object) {
        const bKeys = util_1.util.objectKeys(b);
        const sharedKeys = util_1.util
            .objectKeys(a)
            .filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    else if (aType === util_1.ZodParsedType.array && bType === util_1.ZodParsedType.array) {
        if (a.length !== b.length) {
            return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    else if (aType === util_1.ZodParsedType.date &&
        bType === util_1.ZodParsedType.date &&
        +a === +b) {
        return { valid: true, data: a };
    }
    else {
        return { valid: false };
    }
}
class ZodIntersection extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
            if ((0, parseUtil_1.isAborted)(parsedLeft) || (0, parseUtil_1.isAborted)(parsedRight)) {
                return parseUtil_1.INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.invalid_intersection_types,
                });
                return parseUtil_1.INVALID;
            }
            if ((0, parseUtil_1.isDirty)(parsedLeft) || (0, parseUtil_1.isDirty)(parsedRight)) {
                status.dirty();
            }
            return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
            ]).then(([left, right]) => handleParsed(left, right));
        }
        else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }));
        }
    }
}
exports.ZodIntersection = ZodIntersection;
ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
        left: left,
        right: right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params),
    });
};
class ZodTuple extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.array) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.array,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            return parseUtil_1.INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            status.dirty();
        }
        const items = [...ctx.data]
            .map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema)
                return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        })
            .filter((x) => !!x);
        if (ctx.common.async) {
            return Promise.all(items).then((results) => {
                return parseUtil_1.ParseStatus.mergeArray(status, results);
            });
        }
        else {
            return parseUtil_1.ParseStatus.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest,
        });
    }
}
exports.ZodTuple = ZodTuple;
ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params),
    });
};
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.object) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.object,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
            pairs.push({
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            });
        }
        if (ctx.common.async) {
            return parseUtil_1.ParseStatus.mergeObjectAsync(status, pairs);
        }
        else {
            return parseUtil_1.ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third),
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second),
        });
    }
}
exports.ZodRecord = ZodRecord;
class ZodMap extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.map) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.map,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
            return {
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
                value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])),
            };
        });
        if (ctx.common.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async () => {
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return parseUtil_1.INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return { status: status.value, value: finalMap };
            });
        }
        else {
            const finalMap = new Map();
            for (const pair of pairs) {
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return parseUtil_1.INVALID;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
        }
    }
}
exports.ZodMap = ZodMap;
ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params),
    });
};
class ZodSet extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.set) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.set,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.minSize.message,
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                (0, parseUtil_1.addIssueToContext)(ctx, {
                    code: ZodError_1.ZodIssueCode.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.maxSize.message,
                });
                status.dirty();
            }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements) {
                if (element.status === "aborted")
                    return parseUtil_1.INVALID;
                if (element.status === "dirty")
                    status.dirty();
                parsedSet.add(element.value);
            }
            return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
            return Promise.all(elements).then((elements) => finalizeSet(elements));
        }
        else {
            return finalizeSet(elements);
        }
    }
    min(minSize, message) {
        return new ZodSet({
            ...this._def,
            minSize: { value: minSize, message: errorUtil_1.errorUtil.toString(message) },
        });
    }
    max(maxSize, message) {
        return new ZodSet({
            ...this._def,
            maxSize: { value: maxSize, message: errorUtil_1.errorUtil.toString(message) },
        });
    }
    size(size, message) {
        return this.min(size, message).max(size, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
exports.ZodSet = ZodSet;
ZodSet.create = (valueType, params) => {
    return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params),
    });
};
class ZodFunction extends ZodType {
    constructor() {
        super(...arguments);
        this.validate = this.implement;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.function) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.function,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        function makeArgsIssue(args, error) {
            return (0, parseUtil_1.makeIssue)({
                data: args,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    (0, errors_1.getErrorMap)(),
                    errors_1.defaultErrorMap,
                ].filter((x) => !!x),
                issueData: {
                    code: ZodError_1.ZodIssueCode.invalid_arguments,
                    argumentsError: error,
                },
            });
        }
        function makeReturnsIssue(returns, error) {
            return (0, parseUtil_1.makeIssue)({
                data: returns,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    (0, errors_1.getErrorMap)(),
                    errors_1.defaultErrorMap,
                ].filter((x) => !!x),
                issueData: {
                    code: ZodError_1.ZodIssueCode.invalid_return_type,
                    returnTypeError: error,
                },
            });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            return (0, parseUtil_1.OK)(async (...args) => {
                const error = new ZodError_1.ZodError([]);
                const parsedArgs = await this._def.args
                    .parseAsync(args, params)
                    .catch((e) => {
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await fn(...parsedArgs);
                const parsedReturns = await this._def.returns._def.type
                    .parseAsync(result, params)
                    .catch((e) => {
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        }
        else {
            return (0, parseUtil_1.OK)((...args) => {
                const parsedArgs = this._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError_1.ZodError([makeArgsIssue(args, parsedArgs.error)]);
                }
                const result = fn(...parsedArgs.data);
                const parsedReturns = this._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError_1.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create()),
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType,
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    static create(args, returns, params) {
        return new ZodFunction({
            args: (args
                ? args
                : ZodTuple.create([]).rest(ZodUnknown.create())),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params),
        });
    }
}
exports.ZodFunction = ZodFunction;
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
}
exports.ZodLazy = ZodLazy;
ZodLazy.create = (getter, params) => {
    return new ZodLazy({
        getter: getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params),
    });
};
class ZodLiteral extends ZodType {
    _parse(input) {
        if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                received: ctx.data,
                code: ZodError_1.ZodIssueCode.invalid_literal,
                expected: this._def.value,
            });
            return parseUtil_1.INVALID;
        }
        return { status: "valid", value: input.data };
    }
    get value() {
        return this._def.value;
    }
}
exports.ZodLiteral = ZodLiteral;
ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
        value: value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params),
    });
};
function createZodEnum(values, params) {
    return new ZodEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params),
    });
}
class ZodEnum extends ZodType {
    _parse(input) {
        if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            (0, parseUtil_1.addIssueToContext)(ctx, {
                expected: util_1.util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodError_1.ZodIssueCode.invalid_type,
            });
            return parseUtil_1.INVALID;
        }
        if (this._def.values.indexOf(input.data) === -1) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            (0, parseUtil_1.addIssueToContext)(ctx, {
                received: ctx.data,
                code: ZodError_1.ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    extract(values) {
        return ZodEnum.create(values);
    }
    exclude(values) {
        return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
    }
}
exports.ZodEnum = ZodEnum;
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
    _parse(input) {
        const nativeEnumValues = util_1.util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== util_1.ZodParsedType.string &&
            ctx.parsedType !== util_1.ZodParsedType.number) {
            const expectedValues = util_1.util.objectValues(nativeEnumValues);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                expected: util_1.util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodError_1.ZodIssueCode.invalid_type,
            });
            return parseUtil_1.INVALID;
        }
        if (nativeEnumValues.indexOf(input.data) === -1) {
            const expectedValues = util_1.util.objectValues(nativeEnumValues);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                received: ctx.data,
                code: ZodError_1.ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return parseUtil_1.INVALID;
        }
        return (0, parseUtil_1.OK)(input.data);
    }
    get enum() {
        return this._def.values;
    }
}
exports.ZodNativeEnum = ZodNativeEnum;
ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params),
    });
};
class ZodPromise extends ZodType {
    unwrap() {
        return this._def.type;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util_1.ZodParsedType.promise &&
            ctx.common.async === false) {
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.promise,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        const promisified = ctx.parsedType === util_1.ZodParsedType.promise
            ? ctx.data
            : Promise.resolve(ctx.data);
        return (0, parseUtil_1.OK)(promisified.then((data) => {
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.common.contextualErrorMap,
            });
        }));
    }
}
exports.ZodPromise = ZodPromise;
ZodPromise.create = (schema, params) => {
    return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params),
    });
};
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
            ? this._def.schema.sourceType()
            : this._def.schema;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data);
            if (ctx.common.async) {
                return Promise.resolve(processed).then((processed) => {
                    return this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                });
            }
            else {
                return this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
        const checkCtx = {
            addIssue: (arg) => {
                (0, parseUtil_1.addIssueToContext)(ctx, arg);
                if (arg.fatal) {
                    status.abort();
                }
                else {
                    status.dirty();
                }
            },
            get path() {
                return ctx.path;
            },
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "refinement") {
            const executeRefinement = (acc) => {
                const result = effect.refinement(acc, checkCtx);
                if (ctx.common.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.common.async === false) {
                const inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inner.status === "aborted")
                    return parseUtil_1.INVALID;
                if (inner.status === "dirty")
                    status.dirty();
                executeRefinement(inner.value);
                return { status: status.value, value: inner.value };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then((inner) => {
                    if (inner.status === "aborted")
                        return parseUtil_1.INVALID;
                    if (inner.status === "dirty")
                        status.dirty();
                    return executeRefinement(inner.value).then(() => {
                        return { status: status.value, value: inner.value };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.common.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (!(0, parseUtil_1.isValid)(base))
                    return base;
                const result = effect.transform(base.value, checkCtx);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return { status: status.value, value: result };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then((base) => {
                    if (!(0, parseUtil_1.isValid)(base))
                        return base;
                    return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
                });
            }
        }
        util_1.util.assertNever(effect);
    }
}
exports.ZodEffects = ZodEffects;
exports.ZodTransformer = ZodEffects;
ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params),
    });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params),
    });
};
class ZodOptional extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_1.ZodParsedType.undefined) {
            return (0, parseUtil_1.OK)(undefined);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
exports.ZodOptional = ZodOptional;
ZodOptional.create = (type, params) => {
    return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params),
    });
};
class ZodNullable extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util_1.ZodParsedType.null) {
            return (0, parseUtil_1.OK)(null);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
exports.ZodNullable = ZodNullable;
ZodNullable.create = (type, params) => {
    return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params),
    });
};
class ZodDefault extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === util_1.ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
}
exports.ZodDefault = ZodDefault;
ZodDefault.create = (type, params) => {
    return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function"
            ? params.default
            : () => params.default,
        ...processCreateParams(params),
    });
};
class ZodCatch extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
            ...ctx,
            common: {
                ...ctx.common,
                issues: [],
            },
        };
        const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
                ...newCtx,
            },
        });
        if ((0, parseUtil_1.isAsync)(result)) {
            return result.then((result) => {
                return {
                    status: "valid",
                    value: result.status === "valid"
                        ? result.value
                        : this._def.catchValue({
                            get error() {
                                return new ZodError_1.ZodError(newCtx.common.issues);
                            },
                            input: newCtx.data,
                        }),
                };
            });
        }
        else {
            return {
                status: "valid",
                value: result.status === "valid"
                    ? result.value
                    : this._def.catchValue({
                        get error() {
                            return new ZodError_1.ZodError(newCtx.common.issues);
                        },
                        input: newCtx.data,
                    }),
            };
        }
    }
    removeCatch() {
        return this._def.innerType;
    }
}
exports.ZodCatch = ZodCatch;
ZodCatch.create = (type, params) => {
    return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params),
    });
};
class ZodNaN extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util_1.ZodParsedType.nan) {
            const ctx = this._getOrReturnCtx(input);
            (0, parseUtil_1.addIssueToContext)(ctx, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: util_1.ZodParsedType.nan,
                received: ctx.parsedType,
            });
            return parseUtil_1.INVALID;
        }
        return { status: "valid", value: input.data };
    }
}
exports.ZodNaN = ZodNaN;
ZodNaN.create = (params) => {
    return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params),
    });
};
exports.BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    unwrap() {
        return this._def.type;
    }
}
exports.ZodBranded = ZodBranded;
class ZodPipeline extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
            const handleAsync = async () => {
                const inResult = await this._def.in._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inResult.status === "aborted")
                    return parseUtil_1.INVALID;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return (0, parseUtil_1.DIRTY)(inResult.value);
                }
                else {
                    return this._def.out._parseAsync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            };
            return handleAsync();
        }
        else {
            const inResult = this._def.in._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
            if (inResult.status === "aborted")
                return parseUtil_1.INVALID;
            if (inResult.status === "dirty") {
                status.dirty();
                return {
                    status: "dirty",
                    value: inResult.value,
                };
            }
            else {
                return this._def.out._parseSync({
                    data: inResult.value,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
    }
    static create(a, b) {
        return new ZodPipeline({
            in: a,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline,
        });
    }
}
exports.ZodPipeline = ZodPipeline;
const custom = (check, params = {}, fatal) => {
    if (check)
        return ZodAny.create().superRefine((data, ctx) => {
            var _a, _b;
            if (!check(data)) {
                const p = typeof params === "function"
                    ? params(data)
                    : typeof params === "string"
                        ? { message: params }
                        : params;
                const _fatal = (_b = (_a = p.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
                const p2 = typeof p === "string" ? { message: p } : p;
                ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
            }
        });
    return ZodAny.create();
};
exports.custom = custom;
exports.late = {
    object: ZodObject.lazycreate,
};
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
})(ZodFirstPartyTypeKind = exports.ZodFirstPartyTypeKind || (exports.ZodFirstPartyTypeKind = {}));
class Class {
    constructor(..._) { }
}
const instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`,
}) => (0, exports.custom)((data) => data instanceof cls, params);
exports["instanceof"] = instanceOfType;
const stringType = ZodString.create;
exports.string = stringType;
const numberType = ZodNumber.create;
exports.number = numberType;
const nanType = ZodNaN.create;
exports.nan = nanType;
const bigIntType = ZodBigInt.create;
exports.bigint = bigIntType;
const booleanType = ZodBoolean.create;
exports.boolean = booleanType;
const dateType = ZodDate.create;
exports.date = dateType;
const symbolType = ZodSymbol.create;
exports.symbol = symbolType;
const undefinedType = ZodUndefined.create;
exports.undefined = undefinedType;
const nullType = ZodNull.create;
exports["null"] = nullType;
const anyType = ZodAny.create;
exports.any = anyType;
const unknownType = ZodUnknown.create;
exports.unknown = unknownType;
const neverType = ZodNever.create;
exports.never = neverType;
const voidType = ZodVoid.create;
exports["void"] = voidType;
const arrayType = ZodArray.create;
exports.array = arrayType;
const objectType = ZodObject.create;
exports.object = objectType;
const strictObjectType = ZodObject.strictCreate;
exports.strictObject = strictObjectType;
const unionType = ZodUnion.create;
exports.union = unionType;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
exports.discriminatedUnion = discriminatedUnionType;
const intersectionType = ZodIntersection.create;
exports.intersection = intersectionType;
const tupleType = ZodTuple.create;
exports.tuple = tupleType;
const recordType = ZodRecord.create;
exports.record = recordType;
const mapType = ZodMap.create;
exports.map = mapType;
const setType = ZodSet.create;
exports.set = setType;
const functionType = ZodFunction.create;
exports["function"] = functionType;
const lazyType = ZodLazy.create;
exports.lazy = lazyType;
const literalType = ZodLiteral.create;
exports.literal = literalType;
const enumType = ZodEnum.create;
exports["enum"] = enumType;
const nativeEnumType = ZodNativeEnum.create;
exports.nativeEnum = nativeEnumType;
const promiseType = ZodPromise.create;
exports.promise = promiseType;
const effectsType = ZodEffects.create;
exports.effect = effectsType;
exports.transformer = effectsType;
const optionalType = ZodOptional.create;
exports.optional = optionalType;
const nullableType = ZodNullable.create;
exports.nullable = nullableType;
const preprocessType = ZodEffects.createWithPreprocess;
exports.preprocess = preprocessType;
const pipelineType = ZodPipeline.create;
exports.pipeline = pipelineType;
const ostring = () => stringType().optional();
exports.ostring = ostring;
const onumber = () => numberType().optional();
exports.onumber = onumber;
const oboolean = () => booleanType().optional();
exports.oboolean = oboolean;
exports.coerce = {
    string: ((arg) => ZodString.create({ ...arg, coerce: true })),
    number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
    boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true,
    })),
    bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
    date: ((arg) => ZodDate.create({ ...arg, coerce: true })),
};
exports.NEVER = parseUtil_1.INVALID;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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MEQ7QUFDMUY7QUFDQTtBQUNBLGdDQUFnQywyREFBMkQ7QUFDM0Y7QUFDQTtBQUNBLGdDQUFnQywwREFBMEQ7QUFDMUY7QUFDQTtBQUNBLGdDQUFnQyx3REFBd0Q7QUFDeEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LG9CQUFvQjtBQUNwQixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixlQUFlO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixNQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixNQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUVBQW1FLGNBQWM7QUFDakY7QUFDQTtBQUNBO0FBQ0EsOERBQThELHVCQUF1QixzQkFBc0IsY0FBYztBQUN6SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsNEJBQTRCLGtCQUFrQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixjQUFjO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsY0FBYztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsY0FBYztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGdCQUFnQixjQUFjO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDQSxZQUFZO0FBQ1o7QUFDQSxlQUFlO0FBQ2Y7QUFDQSxlQUFZO0FBQ1o7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQSxlQUFlO0FBQ2Y7QUFDQSxjQUFjO0FBQ2QsbUJBQW1CO0FBQ25CO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsZ0JBQWdCO0FBQ2hCLGNBQWM7QUFDZCx5Q0FBeUMsc0JBQXNCO0FBQy9ELHlDQUF5QyxzQkFBc0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHlDQUF5QyxzQkFBc0I7QUFDL0QscUNBQXFDLHNCQUFzQjtBQUMzRDtBQUNBLGFBQWE7Ozs7Ozs7Ozs7O0FDbnJHYjs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9taWRkbGV3YXJlL3ZlcmlmeS50cyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL3NyYy9yb3V0ZXMvbG9naW4udHMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9zcmMvcm91dGVzL3VzZXJzLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL2ZpcmViYXNlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vc3JjL3V0aWxzL3BhZ2luYXRlLnRzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vbm9kZV9tb2R1bGVzL3pvZC9saWIvWm9kRXJyb3IuanMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9ub2RlX21vZHVsZXMvem9kL2xpYi9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9ub2RlX21vZHVsZXMvem9kL2xpYi9leHRlcm5hbC5qcyIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC8uL25vZGVfbW9kdWxlcy96b2QvbGliL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vbm9kZV9tb2R1bGVzL3pvZC9saWIvaGVscGVycy9wYXJzZVV0aWwuanMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9ub2RlX21vZHVsZXMvem9kL2xpYi9oZWxwZXJzL3R5cGVBbGlhc2VzLmpzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vbm9kZV9tb2R1bGVzL3pvZC9saWIvaGVscGVycy91dGlsLmpzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vbm9kZV9tb2R1bGVzL3pvZC9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvLi9ub2RlX21vZHVsZXMvem9kL2xpYi9sb2NhbGVzL2VuLmpzIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kLy4vbm9kZV9tb2R1bGVzL3pvZC9saWIvdHlwZXMuanMiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJAcHJpc21hL2NsaWVudFwiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiY29yc1wiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzc1wiIiwid2VicGFjazovL2FpZnVrdS1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwidmFsaWRhdG9yXCIiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9haWZ1a3UtYmFja2VuZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYWlmdWt1LWJhY2tlbmQvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuXG5pbXBvcnQgdXNlclJvdXRlciBmcm9tICcuL3JvdXRlcy91c2VycydcbmltcG9ydCBsb2dpblJvdXRlciBmcm9tICcuL3JvdXRlcy9sb2dpbidcblxuY29uc3QgYXBwID0gZXhwcmVzcygpXG5hcHAudXNlKGNvcnMoKSlcbmFwcC51c2UoZXhwcmVzcy5qc29uKCkpXG5hcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKVxuXG5jb25zdCBwb3J0ID0gMzAwMFxuXG5hcHAudXNlKCcvYXBpL3VzZXJzJywgdXNlclJvdXRlcilcbmFwcC51c2UoJy9hcGkvbG9naW4nLCBsb2dpblJvdXRlcilcblxuYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApXG59KVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gXCJzcmMvdXRpbHMvZmlyZWJhc2VcIlxuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgY2hlY2tJZFRva2VuIH0gPSB1c2VGaXJlYmFzZSgpXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBjaGVja0lkVG9rZW4ocmVxKVxuXG4gIGlmICghdXNlci5lcnJvcikge1xuICAgIHJldHVybiBuZXh0KClcbiAgfVxuXG4gIHJlcy5zZW5kKHtcbiAgICBzdGF0dXNDb2RlOiB1c2VyLmVycm9yLmNvZGUsXG4gICAgc3RhdHVzTWVzc2FnZTogJ1VuYXV0aG9yaXplZCcsXG4gICAgbWVzc2FnZTogdXNlci5lcnJvci5tZXNzYWdlLFxuICB9KVxufVxuIiwiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJ1xuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJ1xuaW1wb3J0IHsgdXNlRmlyZWJhc2UgfSBmcm9tICdzcmMvdXRpbHMvZmlyZWJhc2UnXG5pbXBvcnQgeyB2ZXJpZnkgfSBmcm9tICcuLi9taWRkbGV3YXJlL3ZlcmlmeSdcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKVxuXG4vKiogUE9TVCAvdXNlci9sb2dpbiAqL1xucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgdmFsaWQgPSAoXG4gICAgZW1haWw6IGFueSxcbiAgICBwYXNzd29yZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcblxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBbXG4gICAgICBydWxlRW1haWwoKSxcbiAgICAgIHJ1bGVQYXNzd29yZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGxvZ2luYClcbiAgICBjb25zdCB7IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZClcblxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVMb2dpbiA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUxvZ2luYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSBib2R5XG5cbiAgLy8g44Oq44Kv44Ko44K544OI44Oc44OH44Kj44Gn5rih44GV44KM44GfSlNPTuODh+ODvOOCv+OBjOS4jeato+OBquWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnSW52YWxpZCByZXF1ZXN0IGJvZHknLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg5Djg6rjg4fjg7zjgrfjg6fjg7PjgpLooYzjgYTjgIEx44Gk44Gn44KC5LiN5ZCI5qC844Gu5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZChlbWFpbCwgcGFzc3dvcmQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyDjg63jgrDjgqTjg7PjgpLoqabjgb/jgotcbiAgY29uc3QgdXNlciA9IGF3YWl0IGxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgaWYgKHVzZXIuZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolIVFRQ44K544OG44O844K/44K544Kz44O844OJ44Go44Oh44OD44K744O844K444KS5ZCr44KASlNPTuODh+ODvOOCv+OCkui/lOOBmVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSwgbWVzc2FnZSB9ID0gb25GYWlsdXJlTG9naW4odXNlci5lcnJvcilcbiAgICByZXNcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODreOCsOOCpOODs+OBq+aIkOWKn+OBl+OBn+OCieOCr+ODg+OCreODvOOCkuS/neWtmOOBmeOCi1xuICBjb25zdCB0aW1lID0gNjAgKiA2MCAqIDEwMDBcbiAgY29uc3QgZXhwaXJlcyA9IG5ldyBEYXRlKERhdGUubm93KCkgKyB0aW1lKVxuXG4gIHJlcy5jb29raWUoJ3Rva2VuJywgdXNlci5pZFRva2VuLCB7XG4gICAgZXhwaXJlczogZXhwaXJlcyxcbiAgICAvLyBodHRwT25seTogdHJ1ZSxcbiAgICAvLyBzZWN1cmU6IHRydWUsXG4gIH0pXG5cbiAgcmVzXG4gIC5zZW5kKHtcbiAgICB1aWQ6IHVzZXIubG9jYWxJZCxcbiAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgfSlcbn0pXG5cbi8qKiBERUxFVEUgL3VzZXIvbG9naW4gKi9cbnJvdXRlci5kZWxldGUoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpID0+IHtcbiAgdHJ5IHtcbiAgICByZXNcbiAgICAuY2xlYXJDb29raWUoJ3Rva2VuJylcbiAgICAuc2VuZCh7fSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXMuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcbiAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGVycm9yJyxcbiAgICB9KVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gJ3ZhbGlkYXRvcidcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnIC8v44Gf44KB44GX44Gr5L2/44Gj44Gm44G/44KLXG5pbXBvcnQgeyB1c2VGaXJlYmFzZSB9IGZyb20gJ3NyYy91dGlscy9maXJlYmFzZSdcbmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSAnLi4vbWlkZGxld2FyZS92ZXJpZnknXG4vLyBpbXBvcnQgeyBwYWdpbmF0ZSB9IGZyb20gJ3NyYy91dGlscy9wYWdpbmF0ZSdcbmltcG9ydCB7IHBhZ2luYXRlIH0gZnJvbSAnc3JjL3V0aWxzL3BhZ2luYXRlJ1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KClcblxuLyoqIFBPU1QgL2FwaS91c2VycyAqL1xucm91dGVyLnBvc3QoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB2YWxpZCA9IChcbiAgICBlbWFpbDogYW55LFxuICAgIHBhc3N3b3JkOiBhbnksXG4gICAgZGlzcGxheU5hbWU6IGFueSxcbiAgICB0ZW5hbnRJZDogYW55LFxuICApID0+IHtcbiAgICBjb25zdCBydWxlRW1haWwgPSAoKSA9PiB2YWxpZGF0b3IuaXNFbWFpbChlbWFpbClcbiAgICBjb25zdCBydWxlUGFzc3dvcmQgPSAoKSA9PiB2YWxpZGF0b3IuaXNTdHJvbmdQYXNzd29yZChwYXNzd29yZCwgeyBtaW5MZW5ndGg6IDYgfSlcbiAgICBjb25zdCBydWxlRGlzcGxheU5hbWUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpc1NvbWVUZXh0ID0gW1xuICAgICAgICB2YWxpZGF0b3IuaXNBc2NpaShkaXNwbGF5TmFtZSksXG4gICAgICAgIHZhbGlkYXRvci5pc011bHRpYnl0ZShkaXNwbGF5TmFtZSksXG4gICAgICBdLnNvbWUocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgICAgY29uc3QgaXNWYWxpZCA9IFtcbiAgICAgICAgaXNTb21lVGV4dCxcbiAgICAgICAgdmFsaWRhdG9yLmlzTGVuZ3RoKGRpc3BsYXlOYW1lLCB7IG1pbjogMSwgbWF4OiAzMiB9KSxcbiAgICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgICAgcmV0dXJuIGlzVmFsaWRcbiAgICB9XG4gICAgY29uc3QgcnVsZVRlbmFudElkID0gKCkgPT4gdmFsaWRhdG9yLmlzSW50KHRlbmFudElkKVxuXG4gICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IFtcbiAgICAgIHJ1bGVFbWFpbCgpLFxuICAgICAgcnVsZVBhc3N3b3JkKCksXG4gICAgICBydWxlRGlzcGxheU5hbWUoKSxcbiAgICAgIHJ1bGVUZW5hbnRJZCgpLFxuICAgIF0uZXZlcnkocmVzdWx0ID0+IHJlc3VsdCA9PT0gdHJ1ZSlcblxuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gIH1cblxuICBjb25zdCBjcmVhdGVVc2VyVG9GaXJlYmFzZSA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGNyZWF0ZVVzZXJUb0ZpcmViYXNlYClcbiAgICBjb25zdCB7IHNpZ25VcCB9ID0gdXNlRmlyZWJhc2UoKVxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBzaWduVXAoZW1haWwsIHBhc3N3b3JkKVxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZSA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coYG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0ZpcmViYXNlYClcbiAgICBjb25zdCB7IGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UgfSA9IHVzZUZpcmViYXNlKClcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgIGNvbnN0IHsgc3RhdHVzQ29kZSwgc3RhdHVzTWVzc2FnZSB9ID0gZXJyTXNnVG9TdGF0dXNDb2RlQW5kTWVzc2FnZShtZXNzYWdlKVxuICAgIHJldHVybiB7IHN0YXR1c0NvZGUsIHN0YXR1c01lc3NhZ2UsIG1lc3NhZ2UgfVxuICB9XG5cbiAgY29uc3QgY3JlYXRlVXNlclRvRGF0YWJhc2UgPSBhc3luYyAoXG4gICAgdWlkOiBzdHJpbmcsXG4gICAgZW1haWw6IHN0cmluZyxcbiAgICBkaXNwbGF5TmFtZTogc3RyaW5nLFxuICAgIHRlbmFudElkOiBzdHJpbmcsXG4gICAgKSA9PiB7XG4gICAgY29uc29sZS5sb2coYGNyZWF0ZVVzZXJUb0RhdGFiYXNlYClcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgcHJpc21hLnByb2ZpbGUuY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdWlkLFxuICAgICAgICBlbWFpbCxcbiAgICAgICAgZGlzcGxheU5hbWUsXG4gICAgICAgIHRlbmFudElkOiBwYXJzZUludCh0ZW5hbnRJZCksXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvZmlsZSlcbiAgfVxuXG4gIGNvbnN0IG9uRmFpbHVyZUNyZWF0ZVVzZXJUb0RhdGFiYXNlID0gYXN5bmMgKGlkVG9rZW46IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZWApXG4gICAgY29uc3QgeyBkZWxldGVVc2VyIH0gPSB1c2VGaXJlYmFzZSgpXG4gICAgYXdhaXQgZGVsZXRlVXNlcihpZFRva2VuKVxuICB9XG5cbiAgY29uc3QgYm9keSA9IHJlcS5ib2R5XG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQgfSA9IGJvZHlcblxuICAvLyDjg6rjgq/jgqjjgrnjg4jjg5zjg4fjgqPjgafmuKHjgZXjgozjgZ9KU09O44OH44O844K/44GM5LiN5q2j44Gq5aC05ZCI44Gv5L6L5aSW44KS44K544Ot44O844GZ44KLXG4gIGlmICghZW1haWwgfHwgIXBhc3N3b3JkIHx8ICFkaXNwbGF5TmFtZSB8fCAhdGVuYW50SWQpIHtcbiAgICByZXNcbiAgICAuc3RhdHVzKDQwMClcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnQmFkIFJlcXVlc3QnLFxuICAgICAgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdCBib2R5JyxcbiAgICB9KVxuICB9XG5cbiAgLy8g44OQ44Oq44OH44O844K344On44Oz44KS6KGM44GE44CBMeOBpOOBp+OCguS4jeWQiOagvOOBruWgtOWQiOOBr+S+i+WkluOCkuOCueODreODvOOBmeOCi1xuICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWQoZW1haWwsIHBhc3N3b3JkLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gIGlmICghdmFsaWRhdGlvblJlc3VsdCkge1xuICAgIHJlc1xuICAgIC5zdGF0dXMoNDAwKVxuICAgIC5zZW5kKHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgIHN0YXR1c01lc3NhZ2U6ICdCYWQgUmVxdWVzdCcsXG4gICAgICBtZXNzYWdlOiAnVmFsaWRhdGlvbiBmYWlsZWQnLFxuICAgIH0pXG4gIH1cblxuICAvLyBGaXJlYmFzZeOBuOODpuODvOOCtueZu+mMsuOBmeOCi1xuICBjb25zdCB1c2VyID0gYXdhaXQgY3JlYXRlVXNlclRvRmlyZWJhc2UoZW1haWwsIHBhc3N3b3JkKVxuICBpZiAodXNlci5lcnJvcikge1xuICAgIC8vIOWkseaVl+OBl+OBn+OCiUhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgajjg6Hjg4Pjgrvjg7zjgrjjgpLlkKvjgoBKU09O44OH44O844K/44KS6L+U44GZXG4gICAgY29uc3QgeyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlLCBtZXNzYWdlIH0gPSBvbkZhaWx1cmVDcmVhdGVVc2VyVG9GaXJlYmFzZSh1c2VyLmVycm9yKVxuICAgIHJlc1xuICAgIC5zdGF0dXMoc3RhdHVzQ29kZSlcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgc3RhdHVzTWVzc2FnZSxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIOODh+ODvOOCv+ODmeODvOOCueOBuOODl+ODreODleOCo+ODvOODq+aDheWgseOCkueZu+mMsuOBmeOCi1xuICB0cnkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBjcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmxvY2FsSWQsIGVtYWlsLCBkaXNwbGF5TmFtZSwgdGVuYW50SWQpXG4gICAgcmVzLnNlbmQocHJvZmlsZSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyDlpLHmlZfjgZfjgZ/jgolGaXJlYmFzZeOBi+OCieODh+ODvOOCv+OCkuWJiumZpOOBl+OBpkhUVFDjgrnjg4bjg7zjgr/jgrnjgrPjg7zjg4njgpLov5TjgZlcbiAgICBhd2FpdCBvbkZhaWx1cmVDcmVhdGVVc2VyVG9EYXRhYmFzZSh1c2VyLmlkVG9rZW4pXG4gICAgcmVzXG4gICAgLnN0YXR1cyg0MDApXG4gICAgLnNlbmQoe1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgc3RhdHVzTWVzc2FnZTogJ0JhZCBSZXF1ZXN0JyxcbiAgICAgIG1lc3NhZ2U6ICdDcmVhdGUgdG8gZGF0YWJhc2UgZmFpbGVkJyxcbiAgICB9KVxuICB9XG59KVxuXG4vKiogR0VUIC9hcGkvdXNlcnMgKi9cbi8vIHJvdXRlci5nZXQoJy8nLCB2ZXJpZnksIGFzeW5jIChyZXEsIHJlcykgPT4ge1xucm91dGVyLmdldCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHBhZ2UsIHBlclBhZ2UgfSA9IHJlcS5xdWVyeVxuXG4gIGNvbnN0IHJ1bGVQYWdlID0gei5jb2VyY2UubnVtYmVyKCkuaW50KCkubWluKDEpXG4gIGNvbnN0IHJ1bGVQZXJQYWdlID0gei5jb2VyY2UubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCgxMDApXG5cbiAgaWYgKFxuICAgIHJ1bGVQYWdlLnNhZmVQYXJzZShwYWdlKS5zdWNjZXNzID09PSBmYWxzZSB8fFxuICAgIHJ1bGVQZXJQYWdlLnNhZmVQYXJzZShwZXJQYWdlKS5zdWNjZXNzID09PSBmYWxzZVxuICApIHtcbiAgICByZXMuc3RhdHVzKDQyMilcbiAgICAuc2VuZCh7XG4gICAgICBzdGF0dXNDb2RlOiA0MjIsXG4gICAgICBzdGF0dXNNZXNzYWdlOiAnVW5wcm9jZXNzYWJsZSBFbnRpdHknLFxuICAgICAgbWVzc2FnZTogJ1ZhbGlkYXRpb24gZmFpbGVkJyxcbiAgICB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgdXNlcnMgPSBhd2FpdCBwYWdpbmF0ZShyZXEse1xuICAgIHBhZ2U6IHJ1bGVQYWdlLnBhcnNlKHBhZ2UpLFxuICAgIHBlclBhZ2U6IHJ1bGVQZXJQYWdlLnBhcnNlKHBlclBhZ2UpLFxuICAgIHF1ZXJ5Rm46IChhcmdzKSA9PlxuICAgICAgcHJpc21hLnByb2ZpbGUuZmluZE1hbnkoeyAuLi5hcmdzIH0pLFxuICAgIGNvdW50Rm46ICgpID0+IHByaXNtYS5wcm9maWxlLmNvdW50KClcbiAgfSlcblxuICByZXNcbiAgLnN0YXR1cygyMDApXG4gIC5zZW5kKHVzZXJzKVxufSlcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyXG4iLCJpbXBvcnQgeyBSZXF1ZXN0IH0gZnJvbSAnZXhwcmVzcydcblxuZXhwb3J0IGNvbnN0IHVzZUZpcmViYXNlID0gKCkgPT4ge1xuICBjb25zdCBhcGlLZXkgPSAnQUl6YVN5RElyYUhrdUZXWWRJdFdFeWRjZTFkYmFBd0JzUk5OTWVBJ1xuICBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL3YxYFxuXG4gIGNvbnN0IHNpZ25VcCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnblVwYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlVXNlciA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBlbmRQb2ludCA9IGBhY2NvdW50czpkZWxldGVgXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0vJHtlbmRQb2ludH0/a2V5PSR7YXBpS2V5fWBcblxuICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICBpZFRva2VuXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwse1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gIH1cblxuICBjb25zdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBgYWNjb3VudHM6c2lnbkluV2l0aFBhc3N3b3JkYFxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9LyR7ZW5kUG9pbnR9P2tleT0ke2FwaUtleX1gXG5cbiAgICBjb25zdCBib2R5ID0ge1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHJldHVyblNlY3VyZVRva2VuOiB0cnVlLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICB9XG5cbiAgY29uc3QgY2hlY2tJZFRva2VuID0gYXN5bmMgKHJlcTogUmVxdWVzdCkgPT4ge1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYGFjY291bnRzOmxvb2t1cGBcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlVXJsfS8ke2VuZFBvaW50fT9rZXk9JHthcGlLZXl9YFxuXG4gICAgY29uc3QgaWRUb2tlbiA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb25cbiAgICBjb25zdCBib2R5ID0geyBpZFRva2VuIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICB9KVxuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiB1c2VyXG4gIH1cblxuICBjb25zdCBlcnJNc2dUb1N0YXR1c0NvZGVBbmRNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgIGxldCBzdGF0dXNDb2RlXG4gICAgbGV0IHN0YXR1c01lc3NhZ2VcblxuICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgY2FzZSAnSU5WQUxJRF9QQVNTV09SRCc6XG4gICAgICBjYXNlICdFTUFJTF9OT1RfRk9VTkQnOlxuICAgICAgICBzdGF0dXNDb2RlID0gNDAxXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnVW5hdXRob3JpemVkJ1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdPUEVSQVRJT05fTk9UX0FMTE9XRUQnOlxuICAgICAgY2FzZSAnVVNFUl9ESVNBQkxFRCc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDNcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdGb3JiaWRkZW4nXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0VNQUlMX0VYSVNUUyc6XG4gICAgICAgIHN0YXR1c0NvZGUgPSA0MDlcbiAgICAgICAgc3RhdHVzTWVzc2FnZSA9ICdDb25mbGljdCdcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnVE9PX01BTllfQVRURU1QVFNfVFJZX0xBVEVSJzpcbiAgICAgICAgc3RhdHVzQ29kZSA9IDQyOVxuICAgICAgICBzdGF0dXNNZXNzYWdlID0gJ1RvbyBNYW55IFJlcXVlc3RzJ1xuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdGF0dXNDb2RlID0gNTAwXG4gICAgICAgIHN0YXR1c01lc3NhZ2UgPSAnSW50ZXJuYWwgU2VydmVyIEVycm9yJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgICByZXR1cm4geyBzdGF0dXNDb2RlLCBzdGF0dXNNZXNzYWdlIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2lnblVwLFxuICAgIGRlbGV0ZVVzZXIsXG4gICAgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQsXG4gICAgY2hlY2tJZFRva2VuLFxuICAgIGVyck1zZ1RvU3RhdHVzQ29kZUFuZE1lc3NhZ2UsXG4gIH1cbn1cbiIsImltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJ1xuXG4vKipcbiAqIFByaXNtYeOBp+ODmuODvOOCuOODjeODvOOCt+ODp+ODs+OCkuWun+ijheOBmeOCi++8iENsaWVudCBleHRlbnNpb25z44KC5L2/44Gj44Gm44G/44KL77yJXG4gKiBodHRwczovL3plbm4uZGV2L2dpYmphcGFuL2FydGljbGVzLzgxNWMwYTY3ODNkNWZmXG4gKi9cbnR5cGUgUGFnaW5hdGVJbnB1dHM8SXRlbXM+ID0ge1xuICBwYWdlOiBudW1iZXJcbiAgcGVyUGFnZTogbnVtYmVyXG4gIHF1ZXJ5Rm46IChhcmdzOiB7IHNraXA6IG51bWJlcjsgdGFrZTogbnVtYmVyIH0pID0+IFByb21pc2U8SXRlbXM+XG4gIGNvdW50Rm46ICgpID0+IFByb21pc2U8bnVtYmVyPlxufVxuXG50eXBlIFBhZ2luYXRlT3V0cHV0czxJdGVtcz4gPSB7XG4gIGl0ZW1zOiBJdGVtc1xuICBjb3VudDogbnVtYmVyXG4gIHBhZ2VDb3VudDogbnVtYmVyXG4gIGxpbmtzOiBhbnksXG4gIC8vIG1ldGE6IGFueVxufVxuXG50eXBlIFBhZ2VDb250aW51dHkgPSB7XG4gIGxlZnQ6IGJvb2xlYW5cbiAgcmlnaHQ6IGJvb2xlYW5cbn1cblxudHlwZSBQYWdlUG9zaXRpb24gPSAnc3RhcnQnIHwgJ2VuZCcgfCAnbWlkZGxlJ1xuXG50eXBlIFBhZ2VJbmZvID0ge1xuICBwYWdlOiBudW1iZXJcbiAgcGFnZUNvdW50OiBudW1iZXJcbiAgcGFnZVJhbmdlOiBudW1iZXJcbiAgcGVyUGFnZTogbnVtYmVyXG4gIGJhc2VVcmw6IHN0cmluZ1xufVxuXG50eXBlIFBhZ2VMYWJlbCA9IHtcbiAgaWQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIHVybDogc3RyaW5nXG4gIGFjdGl2ZTogYm9vbGVhblxufVxuXG50eXBlIER1cGxpY2F0ZWRMYWJlbCA9IHtcbiAgZGVzY3JpcHRpb246IHN0cmluZ1xuICB2YWx1ZTogc3RyaW5nXG4gIHVybDogc3RyaW5nXG4gIGFjdGl2ZTogYm9vbGVhblxufVxuXG4vKipcbiAqIOODmuODvOOCuOODjeODvOOCt+ODp+ODs+OBleOCjOOBn+ODh+ODvOOCv+OCkuWPluW+l+OBmeOCi1xuICovXG5leHBvcnQgY29uc3QgcGFnaW5hdGUgPSBhc3luYyA8SXRlbXM+KHJlcTogUmVxdWVzdCwge1xuICBwYWdlLFxuICBwZXJQYWdlLFxuICBjb3VudEZuLFxuICBxdWVyeUZuLFxufTogUGFnaW5hdGVJbnB1dHM8SXRlbXM+KTogUHJvbWlzZTxQYWdpbmF0ZU91dHB1dHM8SXRlbXM+PiA9PiB7XG4gIGNvbnN0IFtpdGVtcywgY291bnRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIHF1ZXJ5Rm4oe1xuICAgICAgc2tpcDogcGVyUGFnZSAqIChwYWdlIC0gMSksXG4gICAgICB0YWtlOiBwZXJQYWdlLFxuICAgIH0pLFxuICAgIGNvdW50Rm4oKSxcbiAgXSlcblxuICBjb25zdCBiYXNlVXJsID0gcmVxLmJhc2VVcmxcbiAgY29uc3QgcGFnZUNvdW50ID0gTWF0aC5jZWlsKGNvdW50IC8gcGVyUGFnZSlcbiAgY29uc3QgcGFnZVJhbmdlID0gMlxuICBjb25zdCBmaXJzdFBhZ2UgPSAxXG5cbiAgY29uc3QgbGlua3MgPSB7XG4gICAgZmlyc3Q6IGAke2Jhc2VVcmx9Lz9wYWdlPTEmcGVyUGFnZT0ke3BlclBhZ2V9YCxcbiAgICBwcmV2OiBwYWdlID09PSBmaXJzdFBhZ2UgPyAnJyA6IGAke2Jhc2VVcmx9Lz9wYWdlPSR7cGFnZSAtIDF9JnBlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgbmV4dDogcGFnZSA9PT0gcGFnZUNvdW50ID8gJycgOiBgJHtiYXNlVXJsfS8/cGFnZT0ke3BhZ2UgKyAxfSZwZXJQYWdlPSR7cGVyUGFnZX1gLFxuICAgIGxhc3Q6IGAke2Jhc2VVcmx9Lz9wYWdlPSR7cGFnZUNvdW50fSZwZXJQYWdlPSR7cGVyUGFnZX1gLFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpdGVtcyxcbiAgICBjb3VudCxcbiAgICBwYWdlQ291bnQsXG4gICAgbGlua3MsXG4gICAgLy8gbWV0YTogeyBsaW5rczogbWV0YUxpbmtzIH0sXG4gIH1cbn1cblxuXG4vLyDjg5rjg7zjgrjjg43jg7zjgrfjg6fjg7PnlKjjga7jg5rjg7zjgrjnlarlj7fjg6njg5njg6vjga7phY3liJfjgpLov5TjgZlcbmV4cG9ydCBjb25zdCBjcmVhdGVQYWdlTGFiZWxzID0gKFxuICBwYWdlSW5mbzogUGFnZUluZm8sXG4gICk6IFBhZ2VMYWJlbFtdID0+IHtcbiAgICAvLyDmnIDliJ3jgb7jgZ/jga/mnIDlvozjga7jg5rjg7zjgrjvvZ7nj77lnKjjga7jg5rjg7zjgrjjgYzpgKPntprnmoTjgafjgYLjgovjgYvlkKbjgYvjgpLliKTlrppcbiAgICBjb25zdCBjaGVja1BhZ2VDb250aW51dHkgPSAoXG4gICAgICBwYWdlSW5mbzogUGFnZUluZm9cbiAgICApOiBQYWdlQ29udGludXR5ID0+IHtcbiAgICAgIGNvbnN0IHsgcGFnZSwgcGFnZUNvdW50LCBwYWdlUmFuZ2UgfSA9IHBhZ2VJbmZvXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBwYWdlIC0gcGFnZVJhbmdlIC0gMSA8PSAxLFxuICAgICAgICByaWdodDogcGFnZUNvdW50IC0gcGFnZSA8PSBwYWdlUmFuZ2UgKyAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g54++5Zyo44Gu44Oa44O844K444Gu5L2N572uKOacgOWIneOAgeacgOW+jOOAgemAlOS4rSnjgpLliKTlrppcbiAgICBjb25zdCBjaGVja1BhZ2VQb3NpdGlvbiA9IChcbiAgICAgIHBhZ2VJbmZvOiBQYWdlSW5mb1xuICAgICkgOiBQYWdlUG9zaXRpb24gPT4ge1xuICAgICAgY29uc3QgeyBwYWdlLCBwYWdlQ291bnQgfSA9IHBhZ2VJbmZvXG4gICAgICBpZiAocGFnZSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gJ3N0YXJ0J1xuICAgICAgfSBlbHNlIGlmIChwYWdlID09PSBwYWdlQ291bnQpIHtcbiAgICAgICAgcmV0dXJuICdlbmQnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ21pZGRsZSdcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDjg4njg4Pjg4jjg6njg5njg6vjga7jgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TjgZnjgaDjgZHjga7plqLmlbBcbiAgICBjb25zdCBjcmVhdGVEb3RMYWJlbCA9IChcbiAgICAgIGRlc2NyaXB0aW9uOiAnbGVmdERvdCcgfCAncmlnaHREb3QnXG4gICAgKTogRHVwbGljYXRlZExhYmVsID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB2YWx1ZTogJy4uLicsXG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5oi744KL44O76YCy44KA44Oc44K/44Oz44Op44OZ44Or44Gu44Kq44OW44K444Kn44Kv44OI44KS6L+U44GZ44Gg44GR44Gu6Zai5pWwXG4gICAgY29uc3QgY3JlYXRlTmF2aWdhdGVCdG4gPSAoXG4gICAgICBkaXJlY3Rpb246ICdQcmV2JyB8ICdOZXh0JyxcbiAgICAgIHBhZ2VJbmZvOiBQYWdlSW5mbyxcbiAgICApOiBEdXBsaWNhdGVkTGFiZWwgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGVzY3JpcHRpb246IGRpcmVjdGlvbixcbiAgICAgICAgdmFsdWU6IGRpcmVjdGlvbixcbiAgICAgICAgdXJsOiBgJHtiYXNlVXJsfS8/cGFnZT0ke2RpcmVjdGlvbiA9PT0gJ1ByZXYnID8gcGFnZSAtIDEgOiBwYWdlICsgMSB9JnBlclBhZ2U9JHtwZXJQYWdlfWAsXG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g44Oh44Kk44Oz5Yem55CGXG4gICAgY29uc3QgeyBwYWdlLCBwYWdlQ291bnQsIHBhZ2VSYW5nZSwgcGVyUGFnZSwgYmFzZVVybCB9ID0gcGFnZUluZm9cblxuICAgIGNvbnN0IHsgbGVmdCwgcmlnaHQgfSA9IGNoZWNrUGFnZUNvbnRpbnV0eShwYWdlSW5mbylcbiAgICBjb25zdCBwYWdlUG9zaXRpb24gPSBjaGVja1BhZ2VQb3NpdGlvbihwYWdlSW5mbylcblxuICAgIC8vIOS7peS4i+OAgTfjgaTjga7liIblspDjgYzjgYLjgotcbiAgICBpZiAobGVmdCAmJiByaWdodCAmJiBwYWdlUG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgIC8vIGNvbnN0IGNvbnRpbnVvdXNBbGxBbmRQYWdlU3RhcnQgPSAoKCkgPT4ge30pKClcbiAgICB9IGVsc2UgaWYgKGxlZnQgJiYgcmlnaHQgJiYgcGFnZVBvc2l0aW9uID09PSAnbWlkZGxlJykge1xuICAgICAgLy8gY29uc3QgY29udGludW91c0FsbEFuZFBhZ2VNaWRkbGUgPSAoKCkgPT4ge30pKClcbiAgICB9IGVsc2UgaWYgKGxlZnQgJiYgcmlnaHQgJiYgcGFnZVBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAgLy8gY29uc3QgY29udGludW91c0FsbEFuZFBhZ2VFbmQgPSAoKCkgPT4ge30pKClcbiAgICB9IGVsc2UgaWYgKGxlZnQgJiYgIXJpZ2h0ICYmIHBhZ2VQb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgLy8gY29uc3QgY29udGludW91c0xlZnRBbmRQYWdlU3RhcnQgPSAoKCkgPT4ge30pKClcbiAgICB9IGVsc2UgaWYgKGxlZnQgJiYgIXJpZ2h0ICYmIHBhZ2VQb3NpdGlvbiA9PT0gJ21pZGRsZScpIHtcbiAgICAgIC8vIGNvbnN0IGNvbnRpbnVvdXNMZWZ0QW5kUGFnZU1pZGRsZSA9ICgoKSA9PiB7fSkoKVxuICAgIH0gZWxzZSBpZiAoIWxlZnQgJiYgcmlnaHQgJiYgcGFnZVBvc2l0aW9uID09PSAnbWlkZGxlJykge1xuICAgICAgLy8gY29uc3QgY29udGludW91c1JpZ2h0QW5kUGFnZU1pZGRsZSA9ICgoKSA9PiB7fSkoKVxuICAgIH0gZWxzZSBpZiAoIWxlZnQgJiYgcmlnaHQgJiYgcGFnZVBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAgLy8gY29uc3QgY29udGludW91c1JpZ2h0QW5kUGFnZUVuZCA9ICgoKSA9PiB7fSkoKVxuICAgIH0gZWxzZSBpZiAoIWxlZnQgJiYgIXJpZ2h0ICYmIHBhZ2VQb3NpdGlvbiA9PT0gJ21pZGRsZScpIHtcbiAgICAgIC8vIGNvbnN0IG5vQ29udGludW91c0FuZFBhZ2VNaWRkbGUgPSAoKCkgPT4ge30pKClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coYOaDs+WumuWkluOBruWIhuWykGApXG4gICAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlpvZEVycm9yID0gZXhwb3J0cy5xdW90ZWxlc3NKc29uID0gZXhwb3J0cy5ab2RJc3N1ZUNvZGUgPSB2b2lkIDA7XG5jb25zdCB1dGlsXzEgPSByZXF1aXJlKFwiLi9oZWxwZXJzL3V0aWxcIik7XG5leHBvcnRzLlpvZElzc3VlQ29kZSA9IHV0aWxfMS51dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcImludmFsaWRfdHlwZVwiLFxuICAgIFwiaW52YWxpZF9saXRlcmFsXCIsXG4gICAgXCJjdXN0b21cIixcbiAgICBcImludmFsaWRfdW5pb25cIixcbiAgICBcImludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvclwiLFxuICAgIFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIsXG4gICAgXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxuICAgIFwiaW52YWxpZF9hcmd1bWVudHNcIixcbiAgICBcImludmFsaWRfcmV0dXJuX3R5cGVcIixcbiAgICBcImludmFsaWRfZGF0ZVwiLFxuICAgIFwiaW52YWxpZF9zdHJpbmdcIixcbiAgICBcInRvb19zbWFsbFwiLFxuICAgIFwidG9vX2JpZ1wiLFxuICAgIFwiaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXNcIixcbiAgICBcIm5vdF9tdWx0aXBsZV9vZlwiLFxuICAgIFwibm90X2Zpbml0ZVwiLFxuXSk7XG5jb25zdCBxdW90ZWxlc3NKc29uID0gKG9iaikgPT4ge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDIpO1xuICAgIHJldHVybiBqc29uLnJlcGxhY2UoL1wiKFteXCJdKylcIjovZywgXCIkMTpcIik7XG59O1xuZXhwb3J0cy5xdW90ZWxlc3NKc29uID0gcXVvdGVsZXNzSnNvbjtcbmNsYXNzIFpvZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKGlzc3Vlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IFtdO1xuICAgICAgICB0aGlzLmFkZElzc3VlID0gKHN1YikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIHN1Yl07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkSXNzdWVzID0gKHN1YnMgPSBbXSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIC4uLnN1YnNdO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhY3R1YWxQcm90byA9IG5ldy50YXJnZXQucHJvdG90eXBlO1xuICAgICAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgYWN0dWFsUHJvdG8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX3Byb3RvX18gPSBhY3R1YWxQcm90bztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5hbWUgPSBcIlpvZEVycm9yXCI7XG4gICAgICAgIHRoaXMuaXNzdWVzID0gaXNzdWVzO1xuICAgIH1cbiAgICBnZXQgZXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XG4gICAgfVxuICAgIGZvcm1hdChfbWFwcGVyKSB7XG4gICAgICAgIGNvbnN0IG1hcHBlciA9IF9tYXBwZXIgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChpc3N1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc3N1ZS5tZXNzYWdlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmllbGRFcnJvcnMgPSB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgIGNvbnN0IHByb2Nlc3NFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3VuaW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWUudW5pb25FcnJvcnMubWFwKHByb2Nlc3NFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9yZXR1cm5fdHlwZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcihpc3N1ZS5yZXR1cm5UeXBlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfYXJndW1lbnRzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLmFyZ3VtZW50c0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUucGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRFcnJvcnMuX2Vycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnIgPSBmaWVsZEVycm9ycztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IGlzc3VlLnBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGlzc3VlLnBhdGhbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXJtaW5hbCA9IGkgPT09IGlzc3VlLnBhdGgubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGVybWluYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJvY2Vzc0Vycm9yKHRoaXMpO1xuICAgICAgICByZXR1cm4gZmllbGRFcnJvcnM7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuICAgIH1cbiAgICBnZXQgbWVzc2FnZSgpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuaXNzdWVzLCB1dGlsXzEudXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIsIDIpO1xuICAgIH1cbiAgICBnZXQgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNzdWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgZmxhdHRlbihtYXBwZXIgPSAoaXNzdWUpID0+IGlzc3VlLm1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZmllbGRFcnJvcnMgPSB7fTtcbiAgICAgICAgY29uc3QgZm9ybUVycm9ycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHN1YiBvZiB0aGlzLmlzc3Vlcykge1xuICAgICAgICAgICAgaWYgKHN1Yi5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmaWVsZEVycm9yc1tzdWIucGF0aFswXV0gPSBmaWVsZEVycm9yc1tzdWIucGF0aFswXV0gfHwgW107XG4gICAgICAgICAgICAgICAgZmllbGRFcnJvcnNbc3ViLnBhdGhbMF1dLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9ybUVycm9ycy5wdXNoKG1hcHBlcihzdWIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBmb3JtRXJyb3JzLCBmaWVsZEVycm9ycyB9O1xuICAgIH1cbiAgICBnZXQgZm9ybUVycm9ycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhdHRlbigpO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kRXJyb3IgPSBab2RFcnJvcjtcblpvZEVycm9yLmNyZWF0ZSA9IChpc3N1ZXMpID0+IHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihpc3N1ZXMpO1xuICAgIHJldHVybiBlcnJvcjtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0RXJyb3JNYXAgPSBleHBvcnRzLnNldEVycm9yTWFwID0gZXhwb3J0cy5kZWZhdWx0RXJyb3JNYXAgPSB2b2lkIDA7XG5jb25zdCBlbl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2xvY2FsZXMvZW5cIikpO1xuZXhwb3J0cy5kZWZhdWx0RXJyb3JNYXAgPSBlbl8xLmRlZmF1bHQ7XG5sZXQgb3ZlcnJpZGVFcnJvck1hcCA9IGVuXzEuZGVmYXVsdDtcbmZ1bmN0aW9uIHNldEVycm9yTWFwKG1hcCkge1xuICAgIG92ZXJyaWRlRXJyb3JNYXAgPSBtYXA7XG59XG5leHBvcnRzLnNldEVycm9yTWFwID0gc2V0RXJyb3JNYXA7XG5mdW5jdGlvbiBnZXRFcnJvck1hcCgpIHtcbiAgICByZXR1cm4gb3ZlcnJpZGVFcnJvck1hcDtcbn1cbmV4cG9ydHMuZ2V0RXJyb3JNYXAgPSBnZXRFcnJvck1hcDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZXJyb3JzXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9oZWxwZXJzL3BhcnNlVXRpbFwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vaGVscGVycy90eXBlQWxpYXNlc1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vaGVscGVycy91dGlsXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi90eXBlc1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vWm9kRXJyb3JcIiksIGV4cG9ydHMpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmVycm9yVXRpbCA9IHZvaWQgMDtcbnZhciBlcnJvclV0aWw7XG4oZnVuY3Rpb24gKGVycm9yVXRpbCkge1xuICAgIGVycm9yVXRpbC5lcnJUb09iaiA9IChtZXNzYWdlKSA9PiB0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZSB9IDogbWVzc2FnZSB8fCB7fTtcbiAgICBlcnJvclV0aWwudG9TdHJpbmcgPSAobWVzc2FnZSkgPT4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyBtZXNzYWdlIDogbWVzc2FnZSA9PT0gbnVsbCB8fCBtZXNzYWdlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtZXNzYWdlLm1lc3NhZ2U7XG59KShlcnJvclV0aWwgPSBleHBvcnRzLmVycm9yVXRpbCB8fCAoZXhwb3J0cy5lcnJvclV0aWwgPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmlzQXN5bmMgPSBleHBvcnRzLmlzVmFsaWQgPSBleHBvcnRzLmlzRGlydHkgPSBleHBvcnRzLmlzQWJvcnRlZCA9IGV4cG9ydHMuT0sgPSBleHBvcnRzLkRJUlRZID0gZXhwb3J0cy5JTlZBTElEID0gZXhwb3J0cy5QYXJzZVN0YXR1cyA9IGV4cG9ydHMuYWRkSXNzdWVUb0NvbnRleHQgPSBleHBvcnRzLkVNUFRZX1BBVEggPSBleHBvcnRzLm1ha2VJc3N1ZSA9IHZvaWQgMDtcbmNvbnN0IGVycm9yc18xID0gcmVxdWlyZShcIi4uL2Vycm9yc1wiKTtcbmNvbnN0IGVuXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL2xvY2FsZXMvZW5cIikpO1xuY29uc3QgbWFrZUlzc3VlID0gKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgcGF0aCwgZXJyb3JNYXBzLCBpc3N1ZURhdGEgfSA9IHBhcmFtcztcbiAgICBjb25zdCBmdWxsUGF0aCA9IFsuLi5wYXRoLCAuLi4oaXNzdWVEYXRhLnBhdGggfHwgW10pXTtcbiAgICBjb25zdCBmdWxsSXNzdWUgPSB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgfTtcbiAgICBsZXQgZXJyb3JNZXNzYWdlID0gXCJcIjtcbiAgICBjb25zdCBtYXBzID0gZXJyb3JNYXBzXG4gICAgICAgIC5maWx0ZXIoKG0pID0+ICEhbSlcbiAgICAgICAgLnNsaWNlKClcbiAgICAgICAgLnJldmVyc2UoKTtcbiAgICBmb3IgKGNvbnN0IG1hcCBvZiBtYXBzKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSA9IG1hcChmdWxsSXNzdWUsIHsgZGF0YSwgZGVmYXVsdEVycm9yOiBlcnJvck1lc3NhZ2UgfSkubWVzc2FnZTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICBwYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgbWVzc2FnZTogaXNzdWVEYXRhLm1lc3NhZ2UgfHwgZXJyb3JNZXNzYWdlLFxuICAgIH07XG59O1xuZXhwb3J0cy5tYWtlSXNzdWUgPSBtYWtlSXNzdWU7XG5leHBvcnRzLkVNUFRZX1BBVEggPSBbXTtcbmZ1bmN0aW9uIGFkZElzc3VlVG9Db250ZXh0KGN0eCwgaXNzdWVEYXRhKSB7XG4gICAgY29uc3QgaXNzdWUgPSAoMCwgZXhwb3J0cy5tYWtlSXNzdWUpKHtcbiAgICAgICAgaXNzdWVEYXRhOiBpc3N1ZURhdGEsXG4gICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgZXJyb3JNYXBzOiBbXG4gICAgICAgICAgICBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCxcbiAgICAgICAgICAgIGN0eC5zY2hlbWFFcnJvck1hcCxcbiAgICAgICAgICAgICgwLCBlcnJvcnNfMS5nZXRFcnJvck1hcCkoKSxcbiAgICAgICAgICAgIGVuXzEuZGVmYXVsdCxcbiAgICAgICAgXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgfSk7XG4gICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaChpc3N1ZSk7XG59XG5leHBvcnRzLmFkZElzc3VlVG9Db250ZXh0ID0gYWRkSXNzdWVUb0NvbnRleHQ7XG5jbGFzcyBQYXJzZVN0YXR1cyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcInZhbGlkXCI7XG4gICAgfVxuICAgIGRpcnR5KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gXCJ2YWxpZFwiKVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFwiZGlydHlcIjtcbiAgICB9XG4gICAgYWJvcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImFib3J0ZWRcIjtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IGFycmF5VmFsdWUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgYXJyYXlWYWx1ZS5wdXNoKHMudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogYXJyYXlWYWx1ZSB9O1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgbWVyZ2VPYmplY3RBc3luYyhzdGF0dXMsIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IHN5bmNQYWlycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgIHN5bmNQYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IGF3YWl0IHBhaXIua2V5LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBhd2FpdCBwYWlyLnZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgfVxuICAgIHN0YXRpYyBtZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBmaW5hbE9iamVjdCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsga2V5LCB2YWx1ZSB9ID0gcGFpcjtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gZXhwb3J0cy5JTlZBTElEO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICBpZiAodmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlLnZhbHVlICE9PSBcInVuZGVmaW5lZFwiIHx8IHBhaXIuYWx3YXlzU2V0KSB7XG4gICAgICAgICAgICAgICAgZmluYWxPYmplY3Rba2V5LnZhbHVlXSA9IHZhbHVlLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogZmluYWxPYmplY3QgfTtcbiAgICB9XG59XG5leHBvcnRzLlBhcnNlU3RhdHVzID0gUGFyc2VTdGF0dXM7XG5leHBvcnRzLklOVkFMSUQgPSBPYmplY3QuZnJlZXplKHtcbiAgICBzdGF0dXM6IFwiYWJvcnRlZFwiLFxufSk7XG5jb25zdCBESVJUWSA9ICh2YWx1ZSkgPT4gKHsgc3RhdHVzOiBcImRpcnR5XCIsIHZhbHVlIH0pO1xuZXhwb3J0cy5ESVJUWSA9IERJUlRZO1xuY29uc3QgT0sgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZSB9KTtcbmV4cG9ydHMuT0sgPSBPSztcbmNvbnN0IGlzQWJvcnRlZCA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCI7XG5leHBvcnRzLmlzQWJvcnRlZCA9IGlzQWJvcnRlZDtcbmNvbnN0IGlzRGlydHkgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwiZGlydHlcIjtcbmV4cG9ydHMuaXNEaXJ0eSA9IGlzRGlydHk7XG5jb25zdCBpc1ZhbGlkID0gKHgpID0+IHguc3RhdHVzID09PSBcInZhbGlkXCI7XG5leHBvcnRzLmlzVmFsaWQgPSBpc1ZhbGlkO1xuY29uc3QgaXNBc3luYyA9ICh4KSA9PiB0eXBlb2YgUHJvbWlzZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB4IGluc3RhbmNlb2YgUHJvbWlzZTtcbmV4cG9ydHMuaXNBc3luYyA9IGlzQXN5bmM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRQYXJzZWRUeXBlID0gZXhwb3J0cy5ab2RQYXJzZWRUeXBlID0gZXhwb3J0cy5vYmplY3RVdGlsID0gZXhwb3J0cy51dGlsID0gdm9pZCAwO1xudmFyIHV0aWw7XG4oZnVuY3Rpb24gKHV0aWwpIHtcbiAgICB1dGlsLmFzc2VydEVxdWFsID0gKHZhbCkgPT4gdmFsO1xuICAgIGZ1bmN0aW9uIGFzc2VydElzKF9hcmcpIHsgfVxuICAgIHV0aWwuYXNzZXJ0SXMgPSBhc3NlcnRJcztcbiAgICBmdW5jdGlvbiBhc3NlcnROZXZlcihfeCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9XG4gICAgdXRpbC5hc3NlcnROZXZlciA9IGFzc2VydE5ldmVyO1xuICAgIHV0aWwuYXJyYXlUb0VudW0gPSAoaXRlbXMpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgb2JqW2l0ZW1dID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXMgPSAob2JqKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhvYmopLmZpbHRlcigoaykgPT4gdHlwZW9mIG9ialtvYmpba11dICE9PSBcIm51bWJlclwiKTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHZhbGlkS2V5cykge1xuICAgICAgICAgICAgZmlsdGVyZWRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKGZpbHRlcmVkKTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0VmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RLZXlzKG9iaikubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqW2VdO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0S2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gKG9iaikgPT4gT2JqZWN0LmtleXMob2JqKVxuICAgICAgICA6IChvYmplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9O1xuICAgIHV0aWwuZmluZCA9IChhcnIsIGNoZWNrZXIpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGFycikge1xuICAgICAgICAgICAgaWYgKGNoZWNrZXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIHV0aWwuaXNJbnRlZ2VyID0gdHlwZW9mIE51bWJlci5pc0ludGVnZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICA/ICh2YWwpID0+IE51bWJlci5pc0ludGVnZXIodmFsKVxuICAgICAgICA6ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgaXNGaW5pdGUodmFsKSAmJiBNYXRoLmZsb29yKHZhbCkgPT09IHZhbDtcbiAgICBmdW5jdGlvbiBqb2luVmFsdWVzKGFycmF5LCBzZXBhcmF0b3IgPSBcIiB8IFwiKSB7XG4gICAgICAgIHJldHVybiBhcnJheVxuICAgICAgICAgICAgLm1hcCgodmFsKSA9PiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx9J2AgOiB2YWwpKVxuICAgICAgICAgICAgLmpvaW4oc2VwYXJhdG9yKTtcbiAgICB9XG4gICAgdXRpbC5qb2luVmFsdWVzID0gam9pblZhbHVlcztcbiAgICB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciA9IChfLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbn0pKHV0aWwgPSBleHBvcnRzLnV0aWwgfHwgKGV4cG9ydHMudXRpbCA9IHt9KSk7XG52YXIgb2JqZWN0VXRpbDtcbihmdW5jdGlvbiAob2JqZWN0VXRpbCkge1xuICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXMgPSAoZmlyc3QsIHNlY29uZCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZmlyc3QsXG4gICAgICAgICAgICAuLi5zZWNvbmQsXG4gICAgICAgIH07XG4gICAgfTtcbn0pKG9iamVjdFV0aWwgPSBleHBvcnRzLm9iamVjdFV0aWwgfHwgKGV4cG9ydHMub2JqZWN0VXRpbCA9IHt9KSk7XG5leHBvcnRzLlpvZFBhcnNlZFR5cGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcInN0cmluZ1wiLFxuICAgIFwibmFuXCIsXG4gICAgXCJudW1iZXJcIixcbiAgICBcImludGVnZXJcIixcbiAgICBcImZsb2F0XCIsXG4gICAgXCJib29sZWFuXCIsXG4gICAgXCJkYXRlXCIsXG4gICAgXCJiaWdpbnRcIixcbiAgICBcInN5bWJvbFwiLFxuICAgIFwiZnVuY3Rpb25cIixcbiAgICBcInVuZGVmaW5lZFwiLFxuICAgIFwibnVsbFwiLFxuICAgIFwiYXJyYXlcIixcbiAgICBcIm9iamVjdFwiLFxuICAgIFwidW5rbm93blwiLFxuICAgIFwicHJvbWlzZVwiLFxuICAgIFwidm9pZFwiLFxuICAgIFwibmV2ZXJcIixcbiAgICBcIm1hcFwiLFxuICAgIFwic2V0XCIsXG5dKTtcbmNvbnN0IGdldFBhcnNlZFR5cGUgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS51bmRlZmluZWQ7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBleHBvcnRzLlpvZFBhcnNlZFR5cGUuc3RyaW5nO1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4oZGF0YSkgPyBleHBvcnRzLlpvZFBhcnNlZFR5cGUubmFuIDogZXhwb3J0cy5ab2RQYXJzZWRUeXBlLm51bWJlcjtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiBleHBvcnRzLlpvZFBhcnNlZFR5cGUuYm9vbGVhbjtcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgICByZXR1cm4gZXhwb3J0cy5ab2RQYXJzZWRUeXBlLmZ1bmN0aW9uO1xuICAgICAgICBjYXNlIFwiYmlnaW50XCI6XG4gICAgICAgICAgICByZXR1cm4gZXhwb3J0cy5ab2RQYXJzZWRUeXBlLmJpZ2ludDtcbiAgICAgICAgY2FzZSBcInN5bWJvbFwiOlxuICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS5zeW1ib2w7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS5hcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS5udWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEudGhlbiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgICAgIGRhdGEuY2F0Y2ggJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZGF0YS5jYXRjaCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBNYXAgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBleHBvcnRzLlpvZFBhcnNlZFR5cGUubWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTZXQgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBleHBvcnRzLlpvZFBhcnNlZFR5cGUuc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBEYXRlICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuWm9kUGFyc2VkVHlwZS5vYmplY3Q7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZXhwb3J0cy5ab2RQYXJzZWRUeXBlLnVua25vd247XG4gICAgfVxufTtcbmV4cG9ydHMuZ2V0UGFyc2VkVHlwZSA9IGdldFBhcnNlZFR5cGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX3NldE1vZHVsZURlZmF1bHQpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59KTtcbnZhciBfX2ltcG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0U3RhcikgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMueiA9IHZvaWQgMDtcbmNvbnN0IHogPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcIi4vZXh0ZXJuYWxcIikpO1xuZXhwb3J0cy56ID0gejtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9leHRlcm5hbFwiKSwgZXhwb3J0cyk7XG5leHBvcnRzLmRlZmF1bHQgPSB6O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB1dGlsXzEgPSByZXF1aXJlKFwiLi4vaGVscGVycy91dGlsXCIpO1xuY29uc3QgWm9kRXJyb3JfMSA9IHJlcXVpcmUoXCIuLi9ab2RFcnJvclwiKTtcbmNvbnN0IGVycm9yTWFwID0gKGlzc3VlLCBfY3R4KSA9PiB7XG4gICAgbGV0IG1lc3NhZ2U7XG4gICAgc3dpdGNoIChpc3N1ZS5jb2RlKSB7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnJlY2VpdmVkID09PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJSZXF1aXJlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBFeHBlY3RlZCAke2lzc3VlLmV4cGVjdGVkfSwgcmVjZWl2ZWQgJHtpc3N1ZS5yZWNlaXZlZH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9saXRlcmFsOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGxpdGVyYWwgdmFsdWUsIGV4cGVjdGVkICR7SlNPTi5zdHJpbmdpZnkoaXNzdWUuZXhwZWN0ZWQsIHV0aWxfMS51dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlcil9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnVucmVjb2duaXplZF9rZXlzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBVbnJlY29nbml6ZWQga2V5KHMpIGluIG9iamVjdDogJHt1dGlsXzEudXRpbC5qb2luVmFsdWVzKGlzc3VlLmtleXMsIFwiLCBcIil9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb246XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWUuIEV4cGVjdGVkICR7dXRpbF8xLnV0aWwuam9pblZhbHVlcyhpc3N1ZS5vcHRpb25zKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGVudW0gdmFsdWUuIEV4cGVjdGVkICR7dXRpbF8xLnV0aWwuam9pblZhbHVlcyhpc3N1ZS5vcHRpb25zKX0sIHJlY2VpdmVkICcke2lzc3VlLnJlY2VpdmVkfSdgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9hcmd1bWVudHM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gYXJndW1lbnRzYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfcmV0dXJuX3R5cGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gcmV0dXJuIHR5cGVgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRhdGVgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmc6XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoXCJpbmNsdWRlc1wiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IGluY2x1ZGUgXCIke2lzc3VlLnZhbGlkYXRpb24uaW5jbHVkZXN9XCJgO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24ucG9zaXRpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfSBhdCBvbmUgb3IgbW9yZSBwb3NpdGlvbnMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvICR7aXNzdWUudmFsaWRhdGlvbi5wb3NpdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwic3RhcnRzV2l0aFwiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IHN0YXJ0IHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uc3RhcnRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwiZW5kc1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBlbmQgd2l0aCBcIiR7aXNzdWUudmFsaWRhdGlvbi5lbmRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGlsXzEudXRpbC5hc3NlcnROZXZlcihpc3N1ZS52YWxpZGF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS52YWxpZGF0aW9uICE9PSBcInJlZ2V4XCIpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgJHtpc3N1ZS52YWxpZGF0aW9ufWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fc21hbGw6XG4gICAgICAgICAgICBpZiAoaXNzdWUudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQXJyYXkgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgbW9yZSB0aGFuYH0gJHtpc3N1ZS5taW5pbXVtfSBlbGVtZW50KHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBTdHJpbmcgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgb3ZlcmB9ICR7aXNzdWUubWluaW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0XG4gICAgICAgICAgICAgICAgICAgID8gYGV4YWN0bHkgZXF1YWwgdG8gYFxuICAgICAgICAgICAgICAgICAgICA6IGlzc3VlLmluY2x1c2l2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogYGdyZWF0ZXIgdGhhbiBgfSR7aXNzdWUubWluaW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJkYXRlXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEYXRlIG11c3QgYmUgJHtpc3N1ZS5leGFjdFxuICAgICAgICAgICAgICAgICAgICA/IGBleGFjdGx5IGVxdWFsIHRvIGBcbiAgICAgICAgICAgICAgICAgICAgOiBpc3N1ZS5pbmNsdXNpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGBncmVhdGVyIHRoYW4gYH0ke25ldyBEYXRlKE51bWJlcihpc3N1ZS5taW5pbXVtKSl9YDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkIGlucHV0XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fYmlnOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYHVuZGVyYH0gJHtpc3N1ZS5tYXhpbXVtfSBjaGFyYWN0ZXIocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3RcbiAgICAgICAgICAgICAgICAgICAgPyBgZXhhY3RseWBcbiAgICAgICAgICAgICAgICAgICAgOiBpc3N1ZS5pbmNsdXNpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2BcbiAgICAgICAgICAgICAgICAgICAgICAgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJiaWdpbnRcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEJpZ0ludCBtdXN0IGJlICR7aXNzdWUuZXhhY3RcbiAgICAgICAgICAgICAgICAgICAgPyBgZXhhY3RseWBcbiAgICAgICAgICAgICAgICAgICAgOiBpc3N1ZS5pbmNsdXNpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2BcbiAgICAgICAgICAgICAgICAgICAgICAgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJkYXRlXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEYXRlIG11c3QgYmUgJHtpc3N1ZS5leGFjdFxuICAgICAgICAgICAgICAgICAgICA/IGBleGFjdGx5YFxuICAgICAgICAgICAgICAgICAgICA6IGlzc3VlLmluY2x1c2l2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgc21hbGxlciB0aGFuIG9yIGVxdWFsIHRvYFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBgc21hbGxlciB0aGFuYH0gJHtuZXcgRGF0ZShOdW1iZXIoaXNzdWUubWF4aW11bSkpfWA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZCBpbnB1dFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuY3VzdG9tOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnRlcnNlY3Rpb24gcmVzdWx0cyBjb3VsZCBub3QgYmUgbWVyZ2VkYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke2lzc3VlLm11bHRpcGxlT2Z9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLm5vdF9maW5pdGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJOdW1iZXIgbXVzdCBiZSBmaW5pdGVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbWVzc2FnZSA9IF9jdHguZGVmYXVsdEVycm9yO1xuICAgICAgICAgICAgdXRpbF8xLnV0aWwuYXNzZXJ0TmV2ZXIoaXNzdWUpO1xuICAgIH1cbiAgICByZXR1cm4geyBtZXNzYWdlIH07XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXJyb3JNYXA7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGlzY3JpbWluYXRlZFVuaW9uID0gZXhwb3J0cy5kYXRlID0gZXhwb3J0cy5ib29sZWFuID0gZXhwb3J0cy5iaWdpbnQgPSBleHBvcnRzLmFycmF5ID0gZXhwb3J0cy5hbnkgPSBleHBvcnRzLmNvZXJjZSA9IGV4cG9ydHMuWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0gZXhwb3J0cy5sYXRlID0gZXhwb3J0cy5ab2RTY2hlbWEgPSBleHBvcnRzLlNjaGVtYSA9IGV4cG9ydHMuY3VzdG9tID0gZXhwb3J0cy5ab2RQaXBlbGluZSA9IGV4cG9ydHMuWm9kQnJhbmRlZCA9IGV4cG9ydHMuQlJBTkQgPSBleHBvcnRzLlpvZE5hTiA9IGV4cG9ydHMuWm9kQ2F0Y2ggPSBleHBvcnRzLlpvZERlZmF1bHQgPSBleHBvcnRzLlpvZE51bGxhYmxlID0gZXhwb3J0cy5ab2RPcHRpb25hbCA9IGV4cG9ydHMuWm9kVHJhbnNmb3JtZXIgPSBleHBvcnRzLlpvZEVmZmVjdHMgPSBleHBvcnRzLlpvZFByb21pc2UgPSBleHBvcnRzLlpvZE5hdGl2ZUVudW0gPSBleHBvcnRzLlpvZEVudW0gPSBleHBvcnRzLlpvZExpdGVyYWwgPSBleHBvcnRzLlpvZExhenkgPSBleHBvcnRzLlpvZEZ1bmN0aW9uID0gZXhwb3J0cy5ab2RTZXQgPSBleHBvcnRzLlpvZE1hcCA9IGV4cG9ydHMuWm9kUmVjb3JkID0gZXhwb3J0cy5ab2RUdXBsZSA9IGV4cG9ydHMuWm9kSW50ZXJzZWN0aW9uID0gZXhwb3J0cy5ab2REaXNjcmltaW5hdGVkVW5pb24gPSBleHBvcnRzLlpvZFVuaW9uID0gZXhwb3J0cy5ab2RPYmplY3QgPSBleHBvcnRzLlpvZEFycmF5ID0gZXhwb3J0cy5ab2RWb2lkID0gZXhwb3J0cy5ab2ROZXZlciA9IGV4cG9ydHMuWm9kVW5rbm93biA9IGV4cG9ydHMuWm9kQW55ID0gZXhwb3J0cy5ab2ROdWxsID0gZXhwb3J0cy5ab2RVbmRlZmluZWQgPSBleHBvcnRzLlpvZFN5bWJvbCA9IGV4cG9ydHMuWm9kRGF0ZSA9IGV4cG9ydHMuWm9kQm9vbGVhbiA9IGV4cG9ydHMuWm9kQmlnSW50ID0gZXhwb3J0cy5ab2ROdW1iZXIgPSBleHBvcnRzLlpvZFN0cmluZyA9IGV4cG9ydHMuWm9kVHlwZSA9IHZvaWQgMDtcbmV4cG9ydHMuTkVWRVIgPSBleHBvcnRzLnZvaWQgPSBleHBvcnRzLnVua25vd24gPSBleHBvcnRzLnVuaW9uID0gZXhwb3J0cy51bmRlZmluZWQgPSBleHBvcnRzLnR1cGxlID0gZXhwb3J0cy50cmFuc2Zvcm1lciA9IGV4cG9ydHMuc3ltYm9sID0gZXhwb3J0cy5zdHJpbmcgPSBleHBvcnRzLnN0cmljdE9iamVjdCA9IGV4cG9ydHMuc2V0ID0gZXhwb3J0cy5yZWNvcmQgPSBleHBvcnRzLnByb21pc2UgPSBleHBvcnRzLnByZXByb2Nlc3MgPSBleHBvcnRzLnBpcGVsaW5lID0gZXhwb3J0cy5vc3RyaW5nID0gZXhwb3J0cy5vcHRpb25hbCA9IGV4cG9ydHMub251bWJlciA9IGV4cG9ydHMub2Jvb2xlYW4gPSBleHBvcnRzLm9iamVjdCA9IGV4cG9ydHMubnVtYmVyID0gZXhwb3J0cy5udWxsYWJsZSA9IGV4cG9ydHMubnVsbCA9IGV4cG9ydHMubmV2ZXIgPSBleHBvcnRzLm5hdGl2ZUVudW0gPSBleHBvcnRzLm5hbiA9IGV4cG9ydHMubWFwID0gZXhwb3J0cy5saXRlcmFsID0gZXhwb3J0cy5sYXp5ID0gZXhwb3J0cy5pbnRlcnNlY3Rpb24gPSBleHBvcnRzLmluc3RhbmNlb2YgPSBleHBvcnRzLmZ1bmN0aW9uID0gZXhwb3J0cy5lbnVtID0gZXhwb3J0cy5lZmZlY3QgPSB2b2lkIDA7XG5jb25zdCBlcnJvcnNfMSA9IHJlcXVpcmUoXCIuL2Vycm9yc1wiKTtcbmNvbnN0IGVycm9yVXRpbF8xID0gcmVxdWlyZShcIi4vaGVscGVycy9lcnJvclV0aWxcIik7XG5jb25zdCBwYXJzZVV0aWxfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvcGFyc2VVdGlsXCIpO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcIi4vaGVscGVycy91dGlsXCIpO1xuY29uc3QgWm9kRXJyb3JfMSA9IHJlcXVpcmUoXCIuL1pvZEVycm9yXCIpO1xuY2xhc3MgUGFyc2VJbnB1dExhenlQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHZhbHVlLCBwYXRoLCBrZXkpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkUGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXk7XG4gICAgfVxuICAgIGdldCBwYXRoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlZFBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fa2V5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRQYXRoLnB1c2goLi4udGhpcy5fcGF0aCwgLi4udGhpcy5fa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlZFBhdGgucHVzaCguLi50aGlzLl9wYXRoLCB0aGlzLl9rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRQYXRoO1xuICAgIH1cbn1cbmNvbnN0IGhhbmRsZVJlc3VsdCA9IChjdHgsIHJlc3VsdCkgPT4ge1xuICAgIGlmICgoMCwgcGFyc2VVdGlsXzEuaXNWYWxpZCkocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQudmFsdWUgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghY3R4LmNvbW1vbi5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWxpZGF0aW9uIGZhaWxlZCBidXQgbm8gaXNzdWVzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBnZXQgZXJyb3IoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Vycm9yKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3JfMS5ab2RFcnJvcihjdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbn07XG5mdW5jdGlvbiBwcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcykge1xuICAgIGlmICghcGFyYW1zKVxuICAgICAgICByZXR1cm4ge307XG4gICAgY29uc3QgeyBlcnJvck1hcCwgaW52YWxpZF90eXBlX2Vycm9yLCByZXF1aXJlZF9lcnJvciwgZGVzY3JpcHRpb24gfSA9IHBhcmFtcztcbiAgICBpZiAoZXJyb3JNYXAgJiYgKGludmFsaWRfdHlwZV9lcnJvciB8fCByZXF1aXJlZF9lcnJvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCB1c2UgXCJpbnZhbGlkX3R5cGVfZXJyb3JcIiBvciBcInJlcXVpcmVkX2Vycm9yXCIgaW4gY29uanVuY3Rpb24gd2l0aCBjdXN0b20gZXJyb3IgbWFwLmApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JNYXApXG4gICAgICAgIHJldHVybiB7IGVycm9yTWFwOiBlcnJvck1hcCwgZGVzY3JpcHRpb24gfTtcbiAgICBjb25zdCBjdXN0b21NYXAgPSAoaXNzLCBjdHgpID0+IHtcbiAgICAgICAgaWYgKGlzcy5jb2RlICE9PSBcImludmFsaWRfdHlwZVwiKVxuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICBpZiAodHlwZW9mIGN0eC5kYXRhID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlOiByZXF1aXJlZF9lcnJvciAhPT0gbnVsbCAmJiByZXF1aXJlZF9lcnJvciAhPT0gdm9pZCAwID8gcmVxdWlyZWRfZXJyb3IgOiBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogaW52YWxpZF90eXBlX2Vycm9yICE9PSBudWxsICYmIGludmFsaWRfdHlwZV9lcnJvciAhPT0gdm9pZCAwID8gaW52YWxpZF90eXBlX2Vycm9yIDogY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgIH07XG4gICAgcmV0dXJuIHsgZXJyb3JNYXA6IGN1c3RvbU1hcCwgZGVzY3JpcHRpb24gfTtcbn1cbmNsYXNzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKGRlZikge1xuICAgICAgICB0aGlzLnNwYSA9IHRoaXMuc2FmZVBhcnNlQXN5bmM7XG4gICAgICAgIHRoaXMuX2RlZiA9IGRlZjtcbiAgICAgICAgdGhpcy5wYXJzZSA9IHRoaXMucGFyc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zYWZlUGFyc2UgPSB0aGlzLnNhZmVQYXJzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnBhcnNlQXN5bmMgPSB0aGlzLnBhcnNlQXN5bmMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zYWZlUGFyc2VBc3luYyA9IHRoaXMuc2FmZVBhcnNlQXN5bmMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zcGEgPSB0aGlzLnNwYS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZmluZSA9IHRoaXMucmVmaW5lLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucmVmaW5lbWVudCA9IHRoaXMucmVmaW5lbWVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnN1cGVyUmVmaW5lID0gdGhpcy5zdXBlclJlZmluZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9wdGlvbmFsID0gdGhpcy5vcHRpb25hbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm51bGxhYmxlID0gdGhpcy5udWxsYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm51bGxpc2ggPSB0aGlzLm51bGxpc2guYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5hcnJheSA9IHRoaXMuYXJyYXkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gdGhpcy5wcm9taXNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub3IgPSB0aGlzLm9yLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYW5kID0gdGhpcy5hbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJyYW5kID0gdGhpcy5icmFuZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLmRlZmF1bHQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jYXRjaCA9IHRoaXMuY2F0Y2guYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZXNjcmliZSA9IHRoaXMuZGVzY3JpYmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5waXBlID0gdGhpcy5waXBlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaXNOdWxsYWJsZSA9IHRoaXMuaXNOdWxsYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlzT3B0aW9uYWwgPSB0aGlzLmlzT3B0aW9uYWwuYmluZCh0aGlzKTtcbiAgICB9XG4gICAgZ2V0IGRlc2NyaXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmRlc2NyaXB0aW9uO1xuICAgIH1cbiAgICBfZ2V0VHlwZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gKDAsIHV0aWxfMS5nZXRQYXJzZWRUeXBlKShpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIChjdHggfHwge1xuICAgICAgICAgICAgY29tbW9uOiBpbnB1dC5wYXJlbnQuY29tbW9uLFxuICAgICAgICAgICAgZGF0YTogaW5wdXQuZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6ICgwLCB1dGlsXzEuZ2V0UGFyc2VkVHlwZSkoaW5wdXQuZGF0YSksXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGF0aDogaW5wdXQucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogaW5wdXQucGFyZW50LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzOiBuZXcgcGFyc2VVdGlsXzEuUGFyc2VTdGF0dXMoKSxcbiAgICAgICAgICAgIGN0eDoge1xuICAgICAgICAgICAgICAgIGNvbW1vbjogaW5wdXQucGFyZW50LmNvbW1vbixcbiAgICAgICAgICAgICAgICBkYXRhOiBpbnB1dC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcnNlZFR5cGU6ICgwLCB1dGlsXzEuZ2V0UGFyc2VkVHlwZSkoaW5wdXQuZGF0YSksXG4gICAgICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBpbnB1dC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogaW5wdXQucGFyZW50LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX3BhcnNlU3luYyhpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIGlmICgoMCwgcGFyc2VVdGlsXzEuaXNBc3luYykocmVzdWx0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3luY2hyb25vdXMgcGFyc2UgZW5jb3VudGVyZWQgcHJvbWlzZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgX3BhcnNlQXN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfVxuICAgIHBhcnNlKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNhZmVQYXJzZShkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgc2FmZVBhcnNlKGRhdGEsIHBhcmFtcykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6IChfYSA9IHBhcmFtcyA9PT0gbnVsbCB8fCBwYXJhbXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhcmFtcy5hc3luYykgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXMgPT09IG51bGwgfHwgcGFyYW1zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwYXJhbXMuZXJyb3JNYXAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogKHBhcmFtcyA9PT0gbnVsbCB8fCBwYXJhbXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhcmFtcy5wYXRoKSB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogKDAsIHV0aWxfMS5nZXRQYXJzZWRUeXBlKShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VTeW5jKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgYXN5bmMgcGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zYWZlUGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgYXN5bmMgc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXMgPT09IG51bGwgfHwgcGFyYW1zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwYXJhbXMuZXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogKHBhcmFtcyA9PT0gbnVsbCB8fCBwYXJhbXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhcmFtcy5wYXRoKSB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogKDAsIHV0aWxfMS5nZXRQYXJzZWRUeXBlKShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbWF5YmVBc3luY1Jlc3VsdCA9IHRoaXMuX3BhcnNlKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoKDAsIHBhcnNlVXRpbF8xLmlzQXN5bmMpKG1heWJlQXN5bmNSZXN1bHQpXG4gICAgICAgICAgICA/IG1heWJlQXN5bmNSZXN1bHRcbiAgICAgICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKG1heWJlQXN5bmNSZXN1bHQpKTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlc3VsdChjdHgsIHJlc3VsdCk7XG4gICAgfVxuICAgIHJlZmluZShjaGVjaywgbWVzc2FnZSkge1xuICAgICAgICBjb25zdCBnZXRJc3N1ZVByb3BlcnRpZXMgPSAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG1lc3NhZ2UgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UodmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmaW5lbWVudCgodmFsLCBjdHgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNoZWNrKHZhbCk7XG4gICAgICAgICAgICBjb25zdCBzZXRFcnJvciA9ICgpID0+IGN0eC5hZGRJc3N1ZSh7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgICAgICAgIC4uLmdldElzc3VlUHJvcGVydGllcyh2YWwpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIFByb21pc2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVmaW5lbWVudChjaGVjaywgcmVmaW5lbWVudERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQoKHZhbCwgY3R4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoZWNrKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUodHlwZW9mIHJlZmluZW1lbnREYXRhID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgPyByZWZpbmVtZW50RGF0YSh2YWwsIGN0eClcbiAgICAgICAgICAgICAgICAgICAgOiByZWZpbmVtZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcmVmaW5lbWVudChyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJyZWZpbmVtZW50XCIsIHJlZmluZW1lbnQgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQocmVmaW5lbWVudCk7XG4gICAgfVxuICAgIG9wdGlvbmFsKCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG51bGxhYmxlKCkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG51bGxpc2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm51bGxhYmxlKCkub3B0aW9uYWwoKTtcbiAgICB9XG4gICAgYXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBab2RBcnJheS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgcHJvbWlzZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFByb21pc2UuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG9yKG9wdGlvbikge1xuICAgICAgICByZXR1cm4gWm9kVW5pb24uY3JlYXRlKFt0aGlzLCBvcHRpb25dLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBhbmQoaW5jb21pbmcpIHtcbiAgICAgICAgcmV0dXJuIFpvZEludGVyc2VjdGlvbi5jcmVhdGUodGhpcywgaW5jb21pbmcsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIHRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0gfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRlZmF1bHQoZGVmKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZUZ1bmMgPSB0eXBlb2YgZGVmID09PSBcImZ1bmN0aW9uXCIgPyBkZWYgOiAoKSA9PiBkZWY7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGVmYXVsdCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IGRlZmF1bHRWYWx1ZUZ1bmMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBicmFuZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCcmFuZGVkKHtcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQnJhbmRlZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaChkZWYpIHtcbiAgICAgICAgY29uc3QgY2F0Y2hWYWx1ZUZ1bmMgPSB0eXBlb2YgZGVmID09PSBcImZ1bmN0aW9uXCIgPyBkZWYgOiAoKSA9PiBkZWY7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgaW5uZXJUeXBlOiB0aGlzLFxuICAgICAgICAgICAgY2F0Y2hWYWx1ZTogY2F0Y2hWYWx1ZUZ1bmMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZENhdGNoLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgY29uc3QgVGhpcyA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgICAgIHJldHVybiBuZXcgVGhpcyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpcGUodGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiBab2RQaXBlbGluZS5jcmVhdGUodGhpcywgdGFyZ2V0KTtcbiAgICB9XG4gICAgaXNPcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKHVuZGVmaW5lZCkuc3VjY2VzcztcbiAgICB9XG4gICAgaXNOdWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKG51bGwpLnN1Y2Nlc3M7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RUeXBlID0gWm9kVHlwZTtcbmV4cG9ydHMuU2NoZW1hID0gWm9kVHlwZTtcbmV4cG9ydHMuWm9kU2NoZW1hID0gWm9kVHlwZTtcbmNvbnN0IGN1aWRSZWdleCA9IC9eY1teXFxzLV17OCx9JC9pO1xuY29uc3QgY3VpZDJSZWdleCA9IC9eW2Etel1bYS16MC05XSokLztcbmNvbnN0IHVsaWRSZWdleCA9IC9bMC05QS1ISktNTlAtVFYtWl17MjZ9LztcbmNvbnN0IHV1aWRSZWdleCA9IC9eKFthLWYwLTldezh9LVthLWYwLTldezR9LVsxLTVdW2EtZjAtOV17M30tW2EtZjAtOV17NH0tW2EtZjAtOV17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7XG5jb25zdCBlbWFpbFJlZ2V4ID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbKCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFxdKXwoXFxbSVB2NjooKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpXFxdKXwoW0EtWmEtejAtOV0oW0EtWmEtejAtOS1dKltBLVphLXowLTldKSooXFwuW0EtWmEtel17Mix9KSspKSQvO1xuY29uc3QgZW1vamlSZWdleCA9IC9eKFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9fFxccHtFbW9qaV9Db21wb25lbnR9KSskL3U7XG5jb25zdCBpcHY0UmVnZXggPSAvXigoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKSQvO1xuY29uc3QgaXB2NlJlZ2V4ID0gL14oKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpJC87XG5jb25zdCBkYXRldGltZVJlZ2V4ID0gKGFyZ3MpID0+IHtcbiAgICBpZiAoYXJncy5wcmVjaXNpb24pIHtcbiAgICAgICAgaWYgKGFyZ3Mub2Zmc2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXlxcXFxkezR9LVxcXFxkezJ9LVxcXFxkezJ9VFxcXFxkezJ9OlxcXFxkezJ9OlxcXFxkezJ9XFxcXC5cXFxcZHske2FyZ3MucHJlY2lzaW9ufX0oKFsrLV1cXFxcZHsyfSg6P1xcXFxkezJ9KT8pfFopJGApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF5cXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfVRcXFxcZHsyfTpcXFxcZHsyfTpcXFxcZHsyfVxcXFwuXFxcXGR7JHthcmdzLnByZWNpc2lvbn19WiRgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChhcmdzLnByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgICBpZiAoYXJncy5vZmZzZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeXFxcXGR7NH0tXFxcXGR7Mn0tXFxcXGR7Mn1UXFxcXGR7Mn06XFxcXGR7Mn06XFxcXGR7Mn0oKFsrLV1cXFxcZHsyfSg6P1xcXFxkezJ9KT8pfFopJGApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF5cXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfVRcXFxcZHsyfTpcXFxcZHsyfTpcXFxcZHsyfVokYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChhcmdzLm9mZnNldCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoYF5cXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfVRcXFxcZHsyfTpcXFxcZHsyfTpcXFxcZHsyfShcXFxcLlxcXFxkKyk/KChbKy1dXFxcXGR7Mn0oOj9cXFxcZHsyfSk/KXxaKSRgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeXFxcXGR7NH0tXFxcXGR7Mn0tXFxcXGR7Mn1UXFxcXGR7Mn06XFxcXGR7Mn06XFxcXGR7Mn0oXFxcXC5cXFxcZCspP1okYCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gaXNWYWxpZElQKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY2XCIgfHwgIXZlcnNpb24pICYmIGlwdjZSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY2xhc3MgWm9kU3RyaW5nIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuX3JlZ2V4ID0gKHJlZ2V4LCB2YWxpZGF0aW9uLCBtZXNzYWdlKSA9PiB0aGlzLnJlZmluZW1lbnQoKGRhdGEpID0+IHJlZ2V4LnRlc3QoZGF0YSksIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb24sXG4gICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubm9uZW1wdHkgPSAobWVzc2FnZSkgPT4gdGhpcy5taW4oMSwgZXJyb3JVdGlsXzEuZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpKTtcbiAgICAgICAgdGhpcy50cmltID0gKCkgPT4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCB7IGtpbmQ6IFwidHJpbVwiIH1dLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50b0xvd2VyQ2FzZSA9ICgpID0+IG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvTG93ZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRvVXBwZXJDYXNlID0gKCkgPT4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCB7IGtpbmQ6IFwidG9VcHBlckNhc2VcIiB9XSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IFN0cmluZyhpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5zdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5zdHJpbmcsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgcGFyc2VVdGlsXzEuUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5sZW5ndGggPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcgfHwgdG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVtYWlsXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVtYWlsUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1vamlcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1vamlSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbW9qaVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1dWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1dWlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImN1aWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImN1aWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY3VpZDJcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZDJSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1bGlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXVsaWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1bGlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVybFwiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVSTChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIGNoZWNrLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdFJlc3VsdCA9IGNoZWNrLnJlZ2V4LnRlc3QoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZXN0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJyZWdleFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0cmltXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImluY2x1ZGVzXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuaW5jbHVkZXMoY2hlY2sudmFsdWUsIGNoZWNrLnBvc2l0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogeyBpbmNsdWRlczogY2hlY2sudmFsdWUsIHBvc2l0aW9uOiBjaGVjay5wb3NpdGlvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidG9Mb3dlckNhc2VcIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRvVXBwZXJDYXNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJzdGFydHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuc3RhcnRzV2l0aChjaGVjay52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgc3RhcnRzV2l0aDogY2hlY2sudmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVuZHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuZW5kc1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IGVuZHNXaXRoOiBjaGVjay52YWx1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZXRpbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZGF0ZXRpbWVSZWdleChjaGVjayk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJpcFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSVAoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImlwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsXzEudXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbWFpbChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1haWxcIiwgLi4uZXJyb3JVdGlsXzEuZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1cmwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInVybFwiLCAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGVtb2ppKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJlbW9qaVwiLCAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHV1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInV1aWRcIiwgLi4uZXJyb3JVdGlsXzEuZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJjdWlkXCIsIC4uLmVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgY3VpZDIobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWQyXCIsIC4uLmVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgdWxpZChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwidWxpZFwiLCAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGlwKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJpcFwiLCAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGRhdGV0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICAgICAga2luZDogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgICAgIHByZWNpc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgcHJlY2lzaW9uOiB0eXBlb2YgKG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5wcmVjaXNpb24pID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5wcmVjaXNpb24sXG4gICAgICAgICAgICBvZmZzZXQ6IChfYSA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5vZmZzZXQpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IGZhbHNlLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsXzEuZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5tZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlZ2V4KHJlZ2V4LCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInJlZ2V4XCIsXG4gICAgICAgICAgICByZWdleDogcmVnZXgsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbmNsdWRlcyh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJpbmNsdWRlc1wiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgcG9zaXRpb246IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5wb3NpdGlvbixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGFydHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInN0YXJ0c1dpdGhcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVuZHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImVuZHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluTGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsXzEuZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJsZW5ndGhcIixcbiAgICAgICAgICAgIHZhbHVlOiBsZW4sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWxfMS5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgaXNEYXRldGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRldGltZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1haWwoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1haWxcIik7XG4gICAgfVxuICAgIGdldCBpc1VSTCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1cmxcIik7XG4gICAgfVxuICAgIGdldCBpc0Vtb2ppKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImVtb2ppXCIpO1xuICAgIH1cbiAgICBnZXQgaXNVVUlEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInV1aWRcIik7XG4gICAgfVxuICAgIGdldCBpc0NVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY3VpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRDIoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY3VpZDJcIik7XG4gICAgfVxuICAgIGdldCBpc1VMSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidWxpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzSVAoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaXBcIik7XG4gICAgfVxuICAgIGdldCBtaW5MZW5ndGgoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZ2V0IG1heExlbmd0aCgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kU3RyaW5nID0gWm9kU3RyaW5nO1xuWm9kU3RyaW5nLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFN0cmluZyxcbiAgICAgICAgY29lcmNlOiAoX2EgPSBwYXJhbXMgPT09IG51bGwgfHwgcGFyYW1zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwYXJhbXMuY29lcmNlKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmZ1bmN0aW9uIGZsb2F0U2FmZVJlbWFpbmRlcih2YWwsIHN0ZXApIHtcbiAgICBjb25zdCB2YWxEZWNDb3VudCA9ICh2YWwudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMV0gfHwgXCJcIikubGVuZ3RoO1xuICAgIGNvbnN0IHN0ZXBEZWNDb3VudCA9IChzdGVwLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBkZWNDb3VudCA9IHZhbERlY0NvdW50ID4gc3RlcERlY0NvdW50ID8gdmFsRGVjQ291bnQgOiBzdGVwRGVjQ291bnQ7XG4gICAgY29uc3QgdmFsSW50ID0gcGFyc2VJbnQodmFsLnRvRml4ZWQoZGVjQ291bnQpLnJlcGxhY2UoXCIuXCIsIFwiXCIpKTtcbiAgICBjb25zdCBzdGVwSW50ID0gcGFyc2VJbnQoc3RlcC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgcmV0dXJuICh2YWxJbnQgJSBzdGVwSW50KSAvIE1hdGgucG93KDEwLCBkZWNDb3VudCk7XG59XG5jbGFzcyBab2ROdW1iZXIgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5taW4gPSB0aGlzLmd0ZTtcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmx0ZTtcbiAgICAgICAgdGhpcy5zdGVwID0gdGhpcy5tdWx0aXBsZU9mO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBOdW1iZXIoaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUubnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUubnVtYmVyLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbmV3IHBhcnNlVXRpbF8xLlBhcnNlU3RhdHVzKCk7XG4gICAgICAgIGZvciAoY29uc3QgY2hlY2sgb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoZWNrLmtpbmQgPT09IFwiaW50XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV0aWxfMS51dGlsLmlzSW50ZWdlcihpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImludGVnZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBcImZsb2F0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY2hlY2suaW5jbHVzaXZlXG4gICAgICAgICAgICAgICAgICAgID8gaW5wdXQuZGF0YSA8IGNoZWNrLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogaW5wdXQuZGF0YSA8PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY2hlY2suaW5jbHVzaXZlXG4gICAgICAgICAgICAgICAgICAgID8gaW5wdXQuZGF0YSA+IGNoZWNrLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogaW5wdXQuZGF0YSA+PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsb2F0U2FmZVJlbWFpbmRlcihpbnB1dC5kYXRhLCBjaGVjay52YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImZpbml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5ub3RfZmluaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWxfMS51dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiaW50XCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbnBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluaXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZmluaXRlXCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzYWZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pblZhbHVlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbiAgICBnZXQgaXNJbnQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaW50XCIgfHxcbiAgICAgICAgICAgIChjaC5raW5kID09PSBcIm11bHRpcGxlT2ZcIiAmJiB1dGlsXzEudXRpbC5pc0ludGVnZXIoY2gudmFsdWUpKSk7XG4gICAgfVxuICAgIGdldCBpc0Zpbml0ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGwsIG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwiZmluaXRlXCIgfHxcbiAgICAgICAgICAgICAgICBjaC5raW5kID09PSBcImludFwiIHx8XG4gICAgICAgICAgICAgICAgY2gua2luZCA9PT0gXCJtdWx0aXBsZU9mXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKG1pbikgJiYgTnVtYmVyLmlzRmluaXRlKG1heCk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2ROdW1iZXIgPSBab2ROdW1iZXI7XG5ab2ROdW1iZXIuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROdW1iZXIsXG4gICAgICAgIGNvZXJjZTogKHBhcmFtcyA9PT0gbnVsbCB8fCBwYXJhbXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhcmFtcy5jb2VyY2UpIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kQmlnSW50IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IEJpZ0ludChpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5iaWdpbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5iaWdpbnQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgcGFyc2VVdGlsXzEuUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY2hlY2suaW5jbHVzaXZlXG4gICAgICAgICAgICAgICAgICAgID8gaW5wdXQuZGF0YSA8IGNoZWNrLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogaW5wdXQuZGF0YSA8PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY2hlY2suaW5jbHVzaXZlXG4gICAgICAgICAgICAgICAgICAgID8gaW5wdXQuZGF0YSA+IGNoZWNrLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogaW5wdXQuZGF0YSA+PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEgJSBjaGVjay52YWx1ZSAhPT0gQmlnSW50KDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUubm90X211bHRpcGxlX29mLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVPZjogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbF8xLnV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBndGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGd0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHRlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIHNldExpbWl0KGtpbmQsIHZhbHVlLCBpbmNsdXNpdmUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLmNoZWNrcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBuZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbXVsdGlwbGVPZih2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtdWx0aXBsZU9mXCIsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5leHBvcnRzLlpvZEJpZ0ludCA9IFpvZEJpZ0ludDtcblpvZEJpZ0ludC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgdmFyIF9hO1xuICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCaWdJbnQsXG4gICAgICAgIGNvZXJjZTogKF9hID0gcGFyYW1zID09PSBudWxsIHx8IHBhcmFtcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcGFyYW1zLmNvZXJjZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RCb29sZWFuIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gQm9vbGVhbihpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5ib29sZWFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUuYm9vbGVhbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEuT0spKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kQm9vbGVhbiA9IFpvZEJvb2xlYW47XG5ab2RCb29sZWFuLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEJvb2xlYW4oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEJvb2xlYW4sXG4gICAgICAgIGNvZXJjZTogKHBhcmFtcyA9PT0gbnVsbCB8fCBwYXJhbXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhcmFtcy5jb2VyY2UpIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kRGF0ZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IG5ldyBEYXRlKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLmRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5kYXRlLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzTmFOKGlucHV0LmRhdGEuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX2RhdGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBwYXJzZVV0aWxfMS5QYXJzZVN0YXR1cygpO1xuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEuZ2V0VGltZSgpIDwgY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWxfMS51dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzOiBzdGF0dXMudmFsdWUsXG4gICAgICAgICAgICB2YWx1ZTogbmV3IERhdGUoaW5wdXQuZGF0YS5nZXRUaW1lKCkpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2REYXRlKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIGNoZWNrXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1pbihtaW5EYXRlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heERhdGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4RGF0ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbWluRGF0ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluICE9IG51bGwgPyBuZXcgRGF0ZShtaW4pIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0IG1heERhdGUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heCAhPSBudWxsID8gbmV3IERhdGUobWF4KSA6IG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5ab2REYXRlID0gWm9kRGF0ZTtcblpvZERhdGUuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIGNvZXJjZTogKHBhcmFtcyA9PT0gbnVsbCB8fCBwYXJhbXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhcmFtcy5jb2VyY2UpIHx8IGZhbHNlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERhdGUsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RTeW1ib2wgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUuc3ltYm9sKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUuc3ltYm9sLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgwLCBwYXJzZVV0aWxfMS5PSykoaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RTeW1ib2wgPSBab2RTeW1ib2w7XG5ab2RTeW1ib2wuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3ltYm9sKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTeW1ib2wsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RVbmRlZmluZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUudW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgwLCBwYXJzZVV0aWxfMS5PSykoaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RVbmRlZmluZWQgPSBab2RVbmRlZmluZWQ7XG5ab2RVbmRlZmluZWQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5kZWZpbmVkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmRlZmluZWQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2ROdWxsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5udWxsLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgwLCBwYXJzZVV0aWxfMS5PSykoaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2ROdWxsID0gWm9kTnVsbDtcblpvZE51bGwuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVsbCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmNsYXNzIFpvZEFueSBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLl9hbnkgPSB0cnVlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuICgwLCBwYXJzZVV0aWxfMS5PSykoaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RBbnkgPSBab2RBbnk7XG5ab2RBbnkuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQW55KHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RBbnksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RVbmtub3duIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuX3Vua25vd24gPSB0cnVlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuICgwLCBwYXJzZVV0aWxfMS5PSykoaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RVbmtub3duID0gWm9kVW5rbm93bjtcblpvZFVua25vd24uY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5rbm93bih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVW5rbm93bixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmNsYXNzIFpvZE5ldmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5uZXZlcixcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kTmV2ZXIgPSBab2ROZXZlcjtcblpvZE5ldmVyLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5ldmVyKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROZXZlcixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmNsYXNzIFpvZFZvaWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUudm9pZCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEuT0spKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kVm9pZCA9IFpvZFZvaWQ7XG5ab2RWb2lkLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFZvaWQoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFZvaWQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RBcnJheSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCwgc3RhdHVzIH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5hcnJheSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYuZXhhY3RMZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5leGFjdExlbmd0aC52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY3R4LmRhdGEubGVuZ3RoIDwgZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHRvb0JpZyB8fCB0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IHRvb0JpZyA/IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnRvb19iaWcgOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06ICh0b29TbWFsbCA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06ICh0b29CaWcgPyBkZWYuZXhhY3RMZW5ndGgudmFsdWUgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5leGFjdExlbmd0aC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWluTGVuZ3RoICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgZGVmLm1pbkxlbmd0aC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogZGVmLm1pbkxlbmd0aC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLm1pbkxlbmd0aC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWF4TGVuZ3RoICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoID4gZGVmLm1heExlbmd0aC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhMZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhMZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZUFzeW5jKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpO1xuICAgICAgICAgICAgfSkpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5QYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLnR5cGUuX3BhcnNlU3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5QYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pbkxlbmd0aDogeyB2YWx1ZTogbWluTGVuZ3RoLCBtZXNzYWdlOiBlcnJvclV0aWxfMS5lcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IHsgdmFsdWU6IG1heExlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZW5ndGgobGVuLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgZXhhY3RMZW5ndGg6IHsgdmFsdWU6IGxlbiwgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBtZXNzYWdlKTtcbiAgICB9XG59XG5leHBvcnRzLlpvZEFycmF5ID0gWm9kQXJyYXk7XG5ab2RBcnJheS5jcmVhdGUgPSAoc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICBtaW5MZW5ndGg6IG51bGwsXG4gICAgICAgIG1heExlbmd0aDogbnVsbCxcbiAgICAgICAgZXhhY3RMZW5ndGg6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQXJyYXksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBkZWVwUGFydGlhbGlmeShzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYS5zaGFwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSBzY2hlbWEuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBab2RPcHRpb25hbC5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoZmllbGRTY2hlbWEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi5zY2hlbWEuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZEFycmF5KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICB0eXBlOiBkZWVwUGFydGlhbGlmeShzY2hlbWEuZWxlbWVudCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2ROdWxsYWJsZSkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RUdXBsZSkge1xuICAgICAgICByZXR1cm4gWm9kVHVwbGUuY3JlYXRlKHNjaGVtYS5pdGVtcy5tYXAoKGl0ZW0pID0+IGRlZXBQYXJ0aWFsaWZ5KGl0ZW0pKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cbn1cbmNsYXNzIFpvZE9iamVjdCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLl9jYWNoZWQgPSBudWxsO1xuICAgICAgICB0aGlzLm5vbnN0cmljdCA9IHRoaXMucGFzc3Rocm91Z2g7XG4gICAgICAgIHRoaXMuYXVnbWVudCA9IHRoaXMuZXh0ZW5kO1xuICAgIH1cbiAgICBfZ2V0Q2FjaGVkKCkge1xuICAgICAgICBpZiAodGhpcy5fY2FjaGVkICE9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZDtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLl9kZWYuc2hhcGUoKTtcbiAgICAgICAgY29uc3Qga2V5cyA9IHV0aWxfMS51dGlsLm9iamVjdEtleXMoc2hhcGUpO1xuICAgICAgICByZXR1cm4gKHRoaXMuX2NhY2hlZCA9IHsgc2hhcGUsIGtleXMgfSk7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5vYmplY3QsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCB7IHNoYXBlLCBrZXlzOiBzaGFwZUtleXMgfSA9IHRoaXMuX2dldENhY2hlZCgpO1xuICAgICAgICBjb25zdCBleHRyYUtleXMgPSBbXTtcbiAgICAgICAgaWYgKCEodGhpcy5fZGVmLmNhdGNoYWxsIGluc3RhbmNlb2YgWm9kTmV2ZXIgJiZcbiAgICAgICAgICAgIHRoaXMuX2RlZi51bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNoYXBlS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXBlS2V5cykge1xuICAgICAgICAgICAgY29uc3Qga2V5VmFsaWRhdG9yID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBrZXlWYWxpZGF0b3IuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duS2V5cyA9IHRoaXMuX2RlZi51bmtub3duS2V5cztcbiAgICAgICAgICAgIGlmICh1bmtub3duS2V5cyA9PT0gXCJwYXNzdGhyb3VnaFwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGN0eC5kYXRhW2tleV0gfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLnVucmVjb2duaXplZF9rZXlzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5czogZXh0cmFLZXlzLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaXBcIikge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBab2RPYmplY3QgZXJyb3I6IGludmFsaWQgdW5rbm93bktleXMgdmFsdWUuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjYXRjaGFsbCA9IHRoaXMuX2RlZi5jYXRjaGFsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjYXRjaGFsbC5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3luY1BhaXJzID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXdhaXQgcGFpci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDogcGFpci5hbHdheXNTZXQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3luY1BhaXJzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoc3luY1BhaXJzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLlBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5QYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNoYXBlKCk7XG4gICAgfVxuICAgIHN0cmljdChtZXNzYWdlKSB7XG4gICAgICAgIGVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iajtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgICAgICAuLi4obWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWFwOiAoaXNzdWUsIGN0eCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yID0gKF9jID0gKF9iID0gKF9hID0gdGhpcy5fZGVmKS5lcnJvck1hcCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNhbGwoX2EsIGlzc3VlLCBjdHgpLm1lc3NhZ2UpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IGN0eC5kZWZhdWx0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNzdWUuY29kZSA9PT0gXCJ1bnJlY29nbml6ZWRfa2V5c1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IChfZCA9IGVycm9yVXRpbF8xLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKS5tZXNzYWdlKSAhPT0gbnVsbCAmJiBfZCAhPT0gdm9pZCAwID8gX2QgOiBkZWZhdWx0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdHJpcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhc3N0aHJvdWdoKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJwYXNzdGhyb3VnaFwiLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXh0ZW5kKGF1Z21lbnRhdGlvbikge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1lcmdlKG1lcmdpbmcpIHtcbiAgICAgICAgY29uc3QgbWVyZ2VkID0gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICB1bmtub3duS2V5czogbWVyZ2luZy5fZGVmLnVua25vd25LZXlzLFxuICAgICAgICAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAgICAgICAgIC4uLm1lcmdpbmcuX2RlZi5zaGFwZSgpLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgfVxuICAgIHNldEtleShrZXksIHNjaGVtYSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWdtZW50KHsgW2tleV06IHNjaGVtYSB9KTtcbiAgICB9XG4gICAgY2F0Y2hhbGwoaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2F0Y2hhbGw6IGluZGV4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGljayhtYXNrKSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0ge307XG4gICAgICAgIHV0aWxfMS51dGlsLm9iamVjdEtleXMobWFzaykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAobWFza1trZXldICYmIHRoaXMuc2hhcGVba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvbWl0KG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgdXRpbF8xLnV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGlmICghbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRlZXBQYXJ0aWFsKCkge1xuICAgICAgICByZXR1cm4gZGVlcFBhcnRpYWxpZnkodGhpcyk7XG4gICAgfVxuICAgIHBhcnRpYWwobWFzaykge1xuICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHt9O1xuICAgICAgICB1dGlsXzEudXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICBpZiAobWFzayAmJiAhbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGZpZWxkU2NoZW1hO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGZpZWxkU2NoZW1hLm9wdGlvbmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1aXJlZChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIHV0aWxfMS51dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAobWFzayAmJiAhbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkU2NoZW1hID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgICAgIGxldCBuZXdGaWVsZCA9IGZpZWxkU2NoZW1hO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXdGaWVsZCBpbnN0YW5jZW9mIFpvZE9wdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0ZpZWxkID0gbmV3RmllbGQuX2RlZi5pbm5lclR5cGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBuZXdGaWVsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGtleW9mKCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlWm9kRW51bSh1dGlsXzEudXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKTtcbiAgICB9XG59XG5leHBvcnRzLlpvZE9iamVjdCA9IFpvZE9iamVjdDtcblpvZE9iamVjdC5jcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB1bmtub3duS2V5czogXCJzdHJpcFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kT2JqZWN0LnN0cmljdENyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmljdFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kT2JqZWN0LmxhenljcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX2RlZi5vcHRpb25zO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5yZXN1bHQuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB1bmlvbkVycm9ycyA9IHJlc3VsdHMubWFwKChyZXN1bHQpID0+IG5ldyBab2RFcnJvcl8xLlpvZEVycm9yKHJlc3VsdC5jdHguY29tbW9uLmlzc3VlcykpO1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uLFxuICAgICAgICAgICAgICAgIHVuaW9uRXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKG9wdGlvbnMubWFwKGFzeW5jIChvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEN0eCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IGF3YWl0IG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEN0eCxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGN0eDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKS50aGVuKGhhbmRsZVJlc3VsdHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGRpcnR5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgaXNzdWVzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDdHggPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb3B0aW9uLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIgJiYgIWRpcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcnR5ID0geyByZXN1bHQsIGN0eDogY2hpbGRDdHggfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkQ3R4LmNvbW1vbi5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3Vlcy5wdXNoKGNoaWxkQ3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkaXJ0eSkge1xuICAgICAgICAgICAgICAgIGN0eC5jb21tb24uaXNzdWVzLnB1c2goLi4uZGlydHkuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJ0eS5yZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB1bmlvbkVycm9ycyA9IGlzc3Vlcy5tYXAoKGlzc3VlcykgPT4gbmV3IFpvZEVycm9yXzEuWm9kRXJyb3IoaXNzdWVzKSk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb24sXG4gICAgICAgICAgICAgICAgdW5pb25FcnJvcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm9wdGlvbnM7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RVbmlvbiA9IFpvZFVuaW9uO1xuWm9kVW5pb24uY3JlYXRlID0gKHR5cGVzLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVuaW9uKHtcbiAgICAgICAgb3B0aW9uczogdHlwZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVW5pb24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jb25zdCBnZXREaXNjcmltaW5hdG9yID0gKHR5cGUpID0+IHtcbiAgICBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZExhenkpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5zY2hlbWEpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRWZmZWN0cykge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLmlubmVyVHlwZSgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZExpdGVyYWwpIHtcbiAgICAgICAgcmV0dXJuIFt0eXBlLnZhbHVlXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEVudW0pIHtcbiAgICAgICAgcmV0dXJuIHR5cGUub3B0aW9ucztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE5hdGl2ZUVudW0pIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHR5cGUuZW51bSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2REZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kVW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBbdW5kZWZpbmVkXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn07XG5jbGFzcyBab2REaXNjcmltaW5hdGVkVW5pb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGlzY3JpbWluYXRvciA9IHRoaXMuZGlzY3JpbWluYXRvcjtcbiAgICAgICAgY29uc3QgZGlzY3JpbWluYXRvclZhbHVlID0gY3R4LmRhdGFbZGlzY3JpbWluYXRvcl07XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9uc01hcC5nZXQoZGlzY3JpbWluYXRvclZhbHVlKTtcbiAgICAgICAgaWYgKCFvcHRpb24pIHtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20odGhpcy5vcHRpb25zTWFwLmtleXMoKSksXG4gICAgICAgICAgICAgICAgcGF0aDogW2Rpc2NyaW1pbmF0b3JdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZGlzY3JpbWluYXRvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kaXNjcmltaW5hdG9yO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbiAgICBnZXQgb3B0aW9uc01hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zTWFwO1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGRpc2NyaW1pbmF0b3IsIG9wdGlvbnMsIHBhcmFtcykge1xuICAgICAgICBjb25zdCBvcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2Ygb3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3QgZGlzY3JpbWluYXRvclZhbHVlcyA9IGdldERpc2NyaW1pbmF0b3IodHlwZS5zaGFwZVtkaXNjcmltaW5hdG9yXSk7XG4gICAgICAgICAgICBpZiAoIWRpc2NyaW1pbmF0b3JWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgZGlzY3JpbWluYXRvciB2YWx1ZSBmb3Iga2V5IFxcYCR7ZGlzY3JpbWluYXRvcn1cXGAgY291bGQgbm90IGJlIGV4dHJhY3RlZCBmcm9tIGFsbCBzY2hlbWEgb3B0aW9uc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBkaXNjcmltaW5hdG9yVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnNNYXAuaGFzKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERpc2NyaW1pbmF0b3IgcHJvcGVydHkgJHtTdHJpbmcoZGlzY3JpbWluYXRvcil9IGhhcyBkdXBsaWNhdGUgdmFsdWUgJHtTdHJpbmcodmFsdWUpfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zTWFwLnNldCh2YWx1ZSwgdHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2REaXNjcmltaW5hdGVkVW5pb24oe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REaXNjcmltaW5hdGVkVW5pb24sXG4gICAgICAgICAgICBkaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kRGlzY3JpbWluYXRlZFVuaW9uID0gWm9kRGlzY3JpbWluYXRlZFVuaW9uO1xuZnVuY3Rpb24gbWVyZ2VWYWx1ZXMoYSwgYikge1xuICAgIGNvbnN0IGFUeXBlID0gKDAsIHV0aWxfMS5nZXRQYXJzZWRUeXBlKShhKTtcbiAgICBjb25zdCBiVHlwZSA9ICgwLCB1dGlsXzEuZ2V0UGFyc2VkVHlwZSkoYik7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLm9iamVjdCAmJiBiVHlwZSA9PT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IGJLZXlzID0gdXRpbF8xLnV0aWwub2JqZWN0S2V5cyhiKTtcbiAgICAgICAgY29uc3Qgc2hhcmVkS2V5cyA9IHV0aWxfMS51dGlsXG4gICAgICAgICAgICAub2JqZWN0S2V5cyhhKVxuICAgICAgICAgICAgLmZpbHRlcigoa2V5KSA9PiBiS2V5cy5pbmRleE9mKGtleSkgIT09IC0xKTtcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5hLCAuLi5iIH07XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXJlZEtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYXJlZFZhbHVlID0gbWVyZ2VWYWx1ZXMoYVtrZXldLCBiW2tleV0pO1xuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSBzaGFyZWRWYWx1ZS5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdPYmogfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLmFycmF5ICYmIGJUeXBlID09PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1BID0gYVtpbmRleF07XG4gICAgICAgICAgICBjb25zdCBpdGVtQiA9IGJbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhpdGVtQSwgaXRlbUIpO1xuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChzaGFyZWRWYWx1ZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3QXJyYXkgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLmRhdGUgJiZcbiAgICAgICAgYlR5cGUgPT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLmRhdGUgJiZcbiAgICAgICAgK2EgPT09ICtiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICB9XG59XG5jbGFzcyBab2RJbnRlcnNlY3Rpb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgaGFuZGxlUGFyc2VkID0gKHBhcnNlZExlZnQsIHBhcnNlZFJpZ2h0KSA9PiB7XG4gICAgICAgICAgICBpZiAoKDAsIHBhcnNlVXRpbF8xLmlzQWJvcnRlZCkocGFyc2VkTGVmdCkgfHwgKDAsIHBhcnNlVXRpbF8xLmlzQWJvcnRlZCkocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVZhbHVlcyhwYXJzZWRMZWZ0LnZhbHVlLCBwYXJzZWRSaWdodC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIW1lcmdlZC52YWxpZCkge1xuICAgICAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCgwLCBwYXJzZVV0aWxfMS5pc0RpcnR5KShwYXJzZWRMZWZ0KSB8fCAoMCwgcGFyc2VVdGlsXzEuaXNEaXJ0eSkocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IG1lcmdlZC5kYXRhIH07XG4gICAgICAgIH07XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlZi5sZWZ0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWYucmlnaHQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSkudGhlbigoW2xlZnQsIHJpZ2h0XSkgPT4gaGFuZGxlUGFyc2VkKGxlZnQsIHJpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlUGFyc2VkKHRoaXMuX2RlZi5sZWZ0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSksIHRoaXMuX2RlZi5yaWdodC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuWm9kSW50ZXJzZWN0aW9uID0gWm9kSW50ZXJzZWN0aW9uO1xuWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSA9IChsZWZ0LCByaWdodCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RJbnRlcnNlY3Rpb24oe1xuICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICByaWdodDogcmlnaHQsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kSW50ZXJzZWN0aW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kVHVwbGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWxfMS5ab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA8IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgIG1pbmltdW06IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3QgPSB0aGlzLl9kZWYucmVzdDtcbiAgICAgICAgaWYgKCFyZXN0ICYmIGN0eC5kYXRhLmxlbmd0aCA+IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtcyA9IFsuLi5jdHguZGF0YV1cbiAgICAgICAgICAgIC5tYXAoKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5fZGVmLml0ZW1zW2l0ZW1JbmRleF0gfHwgdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgICAgICBpZiAoIXNjaGVtYSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBzY2hlbWEuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaXRlbUluZGV4KSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiAhIXgpO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGl0ZW1zKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLlBhcnNlU3RhdHVzLm1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLlBhcnNlU3RhdHVzLm1lcmdlQXJyYXkoc3RhdHVzLCBpdGVtcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGl0ZW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLml0ZW1zO1xuICAgIH1cbiAgICByZXN0KHJlc3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICByZXN0LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLlpvZFR1cGxlID0gWm9kVHVwbGU7XG5ab2RUdXBsZS5jcmVhdGUgPSAoc2NoZW1hcywgcGFyYW1zKSA9PiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHNjaGVtYXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHBhc3MgYW4gYXJyYXkgb2Ygc2NoZW1hcyB0byB6LnR1cGxlKFsgLi4uIF0pXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFpvZFR1cGxlKHtcbiAgICAgICAgaXRlbXM6IHNjaGVtYXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVHVwbGUsXG4gICAgICAgIHJlc3Q6IG51bGwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RSZWNvcmQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWxfMS5ab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleToga2V5VHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGtleSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBjdHguZGF0YVtrZXldLCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLlBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgcGFpcnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShmaXJzdCwgc2Vjb25kLCB0aGlyZCkge1xuICAgICAgICBpZiAoc2Vjb25kIGluc3RhbmNlb2YgWm9kVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAgICAgIGtleVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogc2Vjb25kLFxuICAgICAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVjb3JkLFxuICAgICAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcmQpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAga2V5VHlwZTogWm9kU3RyaW5nLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdmFsdWVUeXBlOiBmaXJzdCxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVjb3JkLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhzZWNvbmQpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLlpvZFJlY29yZCA9IFpvZFJlY29yZDtcbmNsYXNzIFpvZE1hcCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IHV0aWxfMS5ab2RQYXJzZWRUeXBlLm1hcCkge1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWxfMS5ab2RQYXJzZWRUeXBlLm1hcCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBbLi4uY3R4LmRhdGEuZW50cmllcygpXS5tYXAoKFtrZXksIHZhbHVlXSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwgW2luZGV4LCBcImtleVwiXSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIFtpbmRleCwgXCJ2YWx1ZVwiXSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxNYXAuc2V0KGtleS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5ab2RNYXAgPSBab2RNYXA7XG5ab2RNYXAuY3JlYXRlID0gKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RNYXAoe1xuICAgICAgICB2YWx1ZVR5cGUsXG4gICAgICAgIGtleVR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTWFwLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kU2V0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUuc2V0KSB7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUuc2V0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVmID0gdGhpcy5fZGVmO1xuICAgICAgICBpZiAoZGVmLm1pblNpemUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5zaXplIDwgZGVmLm1pblNpemUudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5TaXplLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInNldFwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLm1pblNpemUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1heFNpemUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5zaXplID4gZGVmLm1heFNpemUudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4U2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhTaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZnVuY3Rpb24gZmluYWxpemVTZXQoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFNldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICBwYXJzZWRTZXQuYWRkKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBwYXJzZWRTZXQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFsuLi5jdHguZGF0YS52YWx1ZXMoKV0ubWFwKChpdGVtLCBpKSA9PiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpKTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChlbGVtZW50cykudGhlbigoZWxlbWVudHMpID0+IGZpbmFsaXplU2V0KGVsZW1lbnRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmluYWxpemVTZXQoZWxlbWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1pbihtaW5TaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pblNpemU6IHsgdmFsdWU6IG1pblNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbF8xLmVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heFNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4U2l6ZTogeyB2YWx1ZTogbWF4U2l6ZSwgbWVzc2FnZTogZXJyb3JVdGlsXzEuZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaXplKHNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKHNpemUsIG1lc3NhZ2UpLm1heChzaXplLCBtZXNzYWdlKTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RTZXQgPSBab2RTZXQ7XG5ab2RTZXQuY3JlYXRlID0gKHZhbHVlVHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICB2YWx1ZVR5cGUsXG4gICAgICAgIG1pblNpemU6IG51bGwsXG4gICAgICAgIG1heFNpemU6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kU2V0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kRnVuY3Rpb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSA9IHRoaXMuaW1wbGVtZW50O1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUuZnVuY3Rpb24pIHtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsXzEuWm9kUGFyc2VkVHlwZS5mdW5jdGlvbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VBcmdzSXNzdWUoYXJncywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEubWFrZUlzc3VlKSh7XG4gICAgICAgICAgICAgICAgZGF0YTogYXJncyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgICAgIGN0eC5zY2hlbWFFcnJvck1hcCxcbiAgICAgICAgICAgICAgICAgICAgKDAsIGVycm9yc18xLmdldEVycm9yTWFwKSgpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcnNfMS5kZWZhdWx0RXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VSZXR1cm5zSXNzdWUocmV0dXJucywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEubWFrZUlzc3VlKSh7XG4gICAgICAgICAgICAgICAgZGF0YTogcmV0dXJucyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgICAgIGN0eC5zY2hlbWFFcnJvck1hcCxcbiAgICAgICAgICAgICAgICAgICAgKDAsIGVycm9yc18xLmdldEVycm9yTWFwKSgpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcnNfMS5kZWZhdWx0RXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfcmV0dXJuX3R5cGUsXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGVFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHsgZXJyb3JNYXA6IGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwIH07XG4gICAgICAgIGNvbnN0IGZuID0gY3R4LmRhdGE7XG4gICAgICAgIGlmICh0aGlzLl9kZWYucmV0dXJucyBpbnN0YW5jZW9mIFpvZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEuT0spKGFzeW5jICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3JfMS5ab2RFcnJvcihbXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGF3YWl0IHRoaXMuX2RlZi5hcmdzXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUFzeW5jKGFyZ3MsIHBhcmFtcylcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmFkZElzc3VlKG1ha2VBcmdzSXNzdWUoYXJncywgZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmbiguLi5wYXJzZWRBcmdzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRSZXR1cm5zID0gYXdhaXQgdGhpcy5fZGVmLnJldHVybnMuX2RlZi50eXBlXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUFzeW5jKHJlc3VsdCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFJldHVybnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEuT0spKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IHRoaXMuX2RlZi5hcmdzLnNhZmVQYXJzZShhcmdzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkQXJncy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcl8xLlpvZEVycm9yKFttYWtlQXJnc0lzc3VlKGFyZ3MsIHBhcnNlZEFyZ3MuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGZuKC4uLnBhcnNlZEFyZ3MuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkUmV0dXJucyA9IHRoaXMuX2RlZi5yZXR1cm5zLnNhZmVQYXJzZShyZXN1bHQsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRSZXR1cm5zLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFpvZEVycm9yXzEuWm9kRXJyb3IoW21ha2VSZXR1cm5zSXNzdWUocmVzdWx0LCBwYXJzZWRSZXR1cm5zLmVycm9yKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkUmV0dXJucy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGFyYW1ldGVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5hcmdzO1xuICAgIH1cbiAgICByZXR1cm5UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnJldHVybnM7XG4gICAgfVxuICAgIGFyZ3MoLi4uaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBhcmdzOiBab2RUdXBsZS5jcmVhdGUoaXRlbXMpLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm5zKHJldHVyblR5cGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICByZXR1cm5zOiByZXR1cm5UeXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW1wbGVtZW50KGZ1bmMpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkRnVuYyA9IHRoaXMucGFyc2UoZnVuYyk7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZWRGdW5jO1xuICAgIH1cbiAgICBzdHJpY3RJbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYXJncywgcmV0dXJucywgcGFyYW1zKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xuICAgICAgICAgICAgYXJnczogKGFyZ3NcbiAgICAgICAgICAgICAgICA/IGFyZ3NcbiAgICAgICAgICAgICAgICA6IFpvZFR1cGxlLmNyZWF0ZShbXSkucmVzdChab2RVbmtub3duLmNyZWF0ZSgpKSksXG4gICAgICAgICAgICByZXR1cm5zOiByZXR1cm5zIHx8IFpvZFVua25vd24uY3JlYXRlKCksXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEZ1bmN0aW9uLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLlpvZEZ1bmN0aW9uID0gWm9kRnVuY3Rpb247XG5jbGFzcyBab2RMYXp5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgZ2V0IHNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5nZXR0ZXIoKTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBsYXp5U2NoZW1hID0gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgICAgICByZXR1cm4gbGF6eVNjaGVtYS5fcGFyc2UoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kTGF6eSA9IFpvZExhenk7XG5ab2RMYXp5LmNyZWF0ZSA9IChnZXR0ZXIsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTGF6eSh7XG4gICAgICAgIGdldHRlcjogZ2V0dGVyLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExhenksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RMaXRlcmFsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmIChpbnB1dC5kYXRhICE9PSB0aGlzLl9kZWYudmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfbGl0ZXJhbCxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdGhpcy5fZGVmLnZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kTGl0ZXJhbCA9IFpvZExpdGVyYWw7XG5ab2RMaXRlcmFsLmNyZWF0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExpdGVyYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBjcmVhdGVab2RFbnVtKHZhbHVlcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRW51bSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuY2xhc3MgWm9kRW51bSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmRhdGEgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdGhpcy5fZGVmLnZhbHVlcztcbiAgICAgICAgICAgICgwLCBwYXJzZVV0aWxfMS5hZGRJc3N1ZVRvQ29udGV4dCkoY3R4LCB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWxfMS51dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9kZWYudmFsdWVzLmluZGV4T2YoaW5wdXQuZGF0YSkgPT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHRoaXMuX2RlZi52YWx1ZXM7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEuT0spKGlucHV0LmRhdGEpO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZXM7XG4gICAgfVxuICAgIGdldCBlbnVtKCkge1xuICAgICAgICBjb25zdCBlbnVtVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHRoaXMuX2RlZi52YWx1ZXMpIHtcbiAgICAgICAgICAgIGVudW1WYWx1ZXNbdmFsXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW51bVZhbHVlcztcbiAgICB9XG4gICAgZ2V0IFZhbHVlcygpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGdldCBFbnVtKCkge1xuICAgICAgICBjb25zdCBlbnVtVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHRoaXMuX2RlZi52YWx1ZXMpIHtcbiAgICAgICAgICAgIGVudW1WYWx1ZXNbdmFsXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW51bVZhbHVlcztcbiAgICB9XG4gICAgZXh0cmFjdCh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHZhbHVlcyk7XG4gICAgfVxuICAgIGV4Y2x1ZGUodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBab2RFbnVtLmNyZWF0ZSh0aGlzLm9wdGlvbnMuZmlsdGVyKChvcHQpID0+ICF2YWx1ZXMuaW5jbHVkZXMob3B0KSkpO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kRW51bSA9IFpvZEVudW07XG5ab2RFbnVtLmNyZWF0ZSA9IGNyZWF0ZVpvZEVudW07XG5jbGFzcyBab2ROYXRpdmVFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVudW1WYWx1ZXMgPSB1dGlsXzEudXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5zdHJpbmcgJiZcbiAgICAgICAgICAgIGN0eC5wYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5udW1iZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdXRpbF8xLnV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLnV0aWwuam9pblZhbHVlcyhleHBlY3RlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hdGl2ZUVudW1WYWx1ZXMuaW5kZXhPZihpbnB1dC5kYXRhKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdXRpbF8xLnV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kRXJyb3JfMS5ab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGV4cGVjdGVkVmFsdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKDAsIHBhcnNlVXRpbF8xLk9LKShpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kTmF0aXZlRW51bSA9IFpvZE5hdGl2ZUVudW07XG5ab2ROYXRpdmVFbnVtLmNyZWF0ZSA9ICh2YWx1ZXMsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTmF0aXZlRW51bSh7XG4gICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE5hdGl2ZUVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2RQcm9taXNlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5wcm9taXNlICYmXG4gICAgICAgICAgICBjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgKDAsIHBhcnNlVXRpbF8xLmFkZElzc3VlVG9Db250ZXh0KShjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RFcnJvcl8xLlpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWxfMS5ab2RQYXJzZWRUeXBlLnByb21pc2UsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9taXNpZmllZCA9IGN0eC5wYXJzZWRUeXBlID09PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5wcm9taXNlXG4gICAgICAgICAgICA/IGN0eC5kYXRhXG4gICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZShjdHguZGF0YSk7XG4gICAgICAgIHJldHVybiAoMCwgcGFyc2VVdGlsXzEuT0spKHByb21pc2lmaWVkLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5wYXJzZUFzeW5jKGRhdGEsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kUHJvbWlzZSA9IFpvZFByb21pc2U7XG5ab2RQcm9taXNlLmNyZWF0ZSA9IChzY2hlbWEsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUHJvbWlzZSh7XG4gICAgICAgIHR5cGU6IHNjaGVtYSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQcm9taXNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kRWZmZWN0cyBleHRlbmRzIFpvZFR5cGUge1xuICAgIGlubmVyVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIHNvdXJjZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9kZWYudHlwZU5hbWUgPT09IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzXG4gICAgICAgICAgICA/IHRoaXMuX2RlZi5zY2hlbWEuc291cmNlVHlwZSgpXG4gICAgICAgICAgICA6IHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLl9kZWYuZWZmZWN0IHx8IG51bGw7XG4gICAgICAgIGlmIChlZmZlY3QudHlwZSA9PT0gXCJwcmVwcm9jZXNzXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NlZCA9IGVmZmVjdC50cmFuc2Zvcm0oY3R4LmRhdGEpO1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHByb2Nlc3NlZCkudGhlbigocHJvY2Vzc2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHByb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHByb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoZWNrQ3R4ID0ge1xuICAgICAgICAgICAgYWRkSXNzdWU6IChhcmcpID0+IHtcbiAgICAgICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwgYXJnKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJnLmZhdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldCBwYXRoKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdHgucGF0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNoZWNrQ3R4LmFkZElzc3VlID0gY2hlY2tDdHguYWRkSXNzdWUuYmluZChjaGVja0N0eCk7XG4gICAgICAgIGlmIChlZmZlY3QudHlwZSA9PT0gXCJyZWZpbmVtZW50XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVSZWZpbmVtZW50ID0gKGFjYykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGVmZmVjdC5yZWZpbmVtZW50KGFjYywgY2hlY2tDdHgpO1xuICAgICAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgcmVmaW5lbWVudCBlbmNvdW50ZXJlZCBkdXJpbmcgc3luY2hyb25vdXMgcGFyc2Ugb3BlcmF0aW9uLiBVc2UgLnBhcnNlQXN5bmMgaW5zdGVhZC5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5uZXIgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VVdGlsXzEuSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIGV4ZWN1dGVSZWZpbmVtZW50KGlubmVyLnZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlubmVyLnZhbHVlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNjaGVtYVxuICAgICAgICAgICAgICAgICAgICAuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChpbm5lcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVSZWZpbmVtZW50KGlubmVyLnZhbHVlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5uZXIudmFsdWUgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoISgwLCBwYXJzZVV0aWxfMS5pc1ZhbGlkKShiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3luY2hyb25vdXMgdHJhbnNmb3JtIGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWFcbiAgICAgICAgICAgICAgICAgICAgLl9wYXJzZUFzeW5jKHsgZGF0YTogY3R4LmRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoYmFzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISgwLCBwYXJzZVV0aWxfMS5pc1ZhbGlkKShiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGVmZmVjdC50cmFuc2Zvcm0oYmFzZS52YWx1ZSwgY2hlY2tDdHgpKS50aGVuKChyZXN1bHQpID0+ICh7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1dGlsXzEudXRpbC5hc3NlcnROZXZlcihlZmZlY3QpO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kRWZmZWN0cyA9IFpvZEVmZmVjdHM7XG5leHBvcnRzLlpvZFRyYW5zZm9ybWVyID0gWm9kRWZmZWN0cztcblpvZEVmZmVjdHMuY3JlYXRlID0gKHNjaGVtYSwgZWZmZWN0LCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICBzY2hlbWEsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgZWZmZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcyA9IChwcmVwcm9jZXNzLCBzY2hlbWEsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgIHNjaGVtYSxcbiAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwicHJlcHJvY2Vzc1wiLCB0cmFuc2Zvcm06IHByZXByb2Nlc3MgfSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kT3B0aW9uYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSA9PT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlVXRpbF8xLk9LKSh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZShpbnB1dCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RPcHRpb25hbCA9IFpvZE9wdGlvbmFsO1xuWm9kT3B0aW9uYWwuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT3B0aW9uYWwoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT3B0aW9uYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2ROdWxsYWJsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS5udWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlVXRpbF8xLk9LKShudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kTnVsbGFibGUgPSBab2ROdWxsYWJsZTtcblpvZE51bGxhYmxlLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGxhYmxlKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGxhYmxlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kRGVmYXVsdCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgbGV0IGRhdGEgPSBjdHguZGF0YTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlID09PSB1dGlsXzEuWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWYuZGVmYXVsdFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVtb3ZlRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuZXhwb3J0cy5ab2REZWZhdWx0ID0gWm9kRGVmYXVsdDtcblpvZERlZmF1bHQuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGVmYXVsdCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REZWZhdWx0LFxuICAgICAgICBkZWZhdWx0VmFsdWU6IHR5cGVvZiBwYXJhbXMuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICA/IHBhcmFtcy5kZWZhdWx0XG4gICAgICAgICAgICA6ICgpID0+IHBhcmFtcy5kZWZhdWx0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuY2xhc3MgWm9kQ2F0Y2ggZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IG5ld0N0eCA9IHtcbiAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGE6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgcGF0aDogbmV3Q3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IHtcbiAgICAgICAgICAgICAgICAuLi5uZXdDdHgsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCgwLCBwYXJzZVV0aWxfMS5pc0FzeW5jKShyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yXzEuWm9kRXJyb3IobmV3Q3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwidmFsaWRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgID8gcmVzdWx0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogdGhpcy5fZGVmLmNhdGNoVmFsdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgWm9kRXJyb3JfMS5ab2RFcnJvcihuZXdDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlQ2F0Y2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kQ2F0Y2ggPSBab2RDYXRjaDtcblpvZENhdGNoLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZENhdGNoKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZENhdGNoLFxuICAgICAgICBjYXRjaFZhbHVlOiB0eXBlb2YgcGFyYW1zLmNhdGNoID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuY2F0Y2ggOiAoKSA9PiBwYXJhbXMuY2F0Y2gsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5jbGFzcyBab2ROYU4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gdXRpbF8xLlpvZFBhcnNlZFR5cGUubmFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICAoMCwgcGFyc2VVdGlsXzEuYWRkSXNzdWVUb0NvbnRleHQpKGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZEVycm9yXzEuWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbF8xLlpvZFBhcnNlZFR5cGUubmFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxufVxuZXhwb3J0cy5ab2ROYU4gPSBab2ROYU47XG5ab2ROYU4uY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTmFOKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROYU4sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnRzLkJSQU5EID0gU3ltYm9sKFwiem9kX2JyYW5kXCIpO1xuY2xhc3MgWm9kQnJhbmRlZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGN0eC5kYXRhO1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxufVxuZXhwb3J0cy5ab2RCcmFuZGVkID0gWm9kQnJhbmRlZDtcbmNsYXNzIFpvZFBpcGVsaW5lIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVBc3luYyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpblJlc3VsdCA9IGF3YWl0IHRoaXMuX2RlZi5pbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVV0aWxfMS5JTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZVV0aWxfMS5ESVJUWSkoaW5SZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vdXQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUFzeW5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpblJlc3VsdCA9IHRoaXMuX2RlZi5pbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVXRpbF8xLklOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwiZGlydHlcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGluUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RQaXBlbGluZSh7XG4gICAgICAgICAgICBpbjogYSxcbiAgICAgICAgICAgIG91dDogYixcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUGlwZWxpbmUsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuWm9kUGlwZWxpbmUgPSBab2RQaXBlbGluZTtcbmNvbnN0IGN1c3RvbSA9IChjaGVjaywgcGFyYW1zID0ge30sIGZhdGFsKSA9PiB7XG4gICAgaWYgKGNoZWNrKVxuICAgICAgICByZXR1cm4gWm9kQW55LmNyZWF0ZSgpLnN1cGVyUmVmaW5lKChkYXRhLCBjdHgpID0+IHtcbiAgICAgICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgICAgICBpZiAoIWNoZWNrKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgICAgICAgICA/IHBhcmFtcyhkYXRhKVxuICAgICAgICAgICAgICAgICAgICA6IHR5cGVvZiBwYXJhbXMgPT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8geyBtZXNzYWdlOiBwYXJhbXMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXJhbXM7XG4gICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gKF9iID0gKF9hID0gcC5mYXRhbCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogZmF0YWwpICE9PSBudWxsICYmIF9iICE9PSB2b2lkIDAgPyBfYiA6IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcDIgPSB0eXBlb2YgcCA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcCB9IDogcDtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUoeyBjb2RlOiBcImN1c3RvbVwiLCAuLi5wMiwgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKTtcbn07XG5leHBvcnRzLmN1c3RvbSA9IGN1c3RvbTtcbmV4cG9ydHMubGF0ZSA9IHtcbiAgICBvYmplY3Q6IFpvZE9iamVjdC5sYXp5Y3JlYXRlLFxufTtcbnZhciBab2RGaXJzdFBhcnR5VHlwZUtpbmQ7XG4oZnVuY3Rpb24gKFpvZEZpcnN0UGFydHlUeXBlS2luZCkge1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFN0cmluZ1wiXSA9IFwiWm9kU3RyaW5nXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTnVtYmVyXCJdID0gXCJab2ROdW1iZXJcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROYU5cIl0gPSBcIlpvZE5hTlwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJpZ0ludFwiXSA9IFwiWm9kQmlnSW50XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQm9vbGVhblwiXSA9IFwiWm9kQm9vbGVhblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZERhdGVcIl0gPSBcIlpvZERhdGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTeW1ib2xcIl0gPSBcIlpvZFN5bWJvbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVuZGVmaW5lZFwiXSA9IFwiWm9kVW5kZWZpbmVkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTnVsbFwiXSA9IFwiWm9kTnVsbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEFueVwiXSA9IFwiWm9kQW55XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVW5rbm93blwiXSA9IFwiWm9kVW5rbm93blwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5ldmVyXCJdID0gXCJab2ROZXZlclwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFZvaWRcIl0gPSBcIlpvZFZvaWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RBcnJheVwiXSA9IFwiWm9kQXJyYXlcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RPYmplY3RcIl0gPSBcIlpvZE9iamVjdFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVuaW9uXCJdID0gXCJab2RVbmlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiXSA9IFwiWm9kRGlzY3JpbWluYXRlZFVuaW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kSW50ZXJzZWN0aW9uXCJdID0gXCJab2RJbnRlcnNlY3Rpb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RUdXBsZVwiXSA9IFwiWm9kVHVwbGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RSZWNvcmRcIl0gPSBcIlpvZFJlY29yZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE1hcFwiXSA9IFwiWm9kTWFwXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU2V0XCJdID0gXCJab2RTZXRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RGdW5jdGlvblwiXSA9IFwiWm9kRnVuY3Rpb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RMYXp5XCJdID0gXCJab2RMYXp5XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTGl0ZXJhbFwiXSA9IFwiWm9kTGl0ZXJhbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEVudW1cIl0gPSBcIlpvZEVudW1cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RFZmZlY3RzXCJdID0gXCJab2RFZmZlY3RzXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmF0aXZlRW51bVwiXSA9IFwiWm9kTmF0aXZlRW51bVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE9wdGlvbmFsXCJdID0gXCJab2RPcHRpb25hbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bGxhYmxlXCJdID0gXCJab2ROdWxsYWJsZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZERlZmF1bHRcIl0gPSBcIlpvZERlZmF1bHRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RDYXRjaFwiXSA9IFwiWm9kQ2F0Y2hcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RQcm9taXNlXCJdID0gXCJab2RQcm9taXNlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQnJhbmRlZFwiXSA9IFwiWm9kQnJhbmRlZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFBpcGVsaW5lXCJdID0gXCJab2RQaXBlbGluZVwiO1xufSkoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0gZXhwb3J0cy5ab2RGaXJzdFBhcnR5VHlwZUtpbmQgfHwgKGV4cG9ydHMuWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0ge30pKTtcbmNsYXNzIENsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5fKSB7IH1cbn1cbmNvbnN0IGluc3RhbmNlT2ZUeXBlID0gKGNscywgcGFyYW1zID0ge1xuICAgIG1lc3NhZ2U6IGBJbnB1dCBub3QgaW5zdGFuY2Ugb2YgJHtjbHMubmFtZX1gLFxufSkgPT4gKDAsIGV4cG9ydHMuY3VzdG9tKSgoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIGNscywgcGFyYW1zKTtcbmV4cG9ydHMuaW5zdGFuY2VvZiA9IGluc3RhbmNlT2ZUeXBlO1xuY29uc3Qgc3RyaW5nVHlwZSA9IFpvZFN0cmluZy5jcmVhdGU7XG5leHBvcnRzLnN0cmluZyA9IHN0cmluZ1R5cGU7XG5jb25zdCBudW1iZXJUeXBlID0gWm9kTnVtYmVyLmNyZWF0ZTtcbmV4cG9ydHMubnVtYmVyID0gbnVtYmVyVHlwZTtcbmNvbnN0IG5hblR5cGUgPSBab2ROYU4uY3JlYXRlO1xuZXhwb3J0cy5uYW4gPSBuYW5UeXBlO1xuY29uc3QgYmlnSW50VHlwZSA9IFpvZEJpZ0ludC5jcmVhdGU7XG5leHBvcnRzLmJpZ2ludCA9IGJpZ0ludFR5cGU7XG5jb25zdCBib29sZWFuVHlwZSA9IFpvZEJvb2xlYW4uY3JlYXRlO1xuZXhwb3J0cy5ib29sZWFuID0gYm9vbGVhblR5cGU7XG5jb25zdCBkYXRlVHlwZSA9IFpvZERhdGUuY3JlYXRlO1xuZXhwb3J0cy5kYXRlID0gZGF0ZVR5cGU7XG5jb25zdCBzeW1ib2xUeXBlID0gWm9kU3ltYm9sLmNyZWF0ZTtcbmV4cG9ydHMuc3ltYm9sID0gc3ltYm9sVHlwZTtcbmNvbnN0IHVuZGVmaW5lZFR5cGUgPSBab2RVbmRlZmluZWQuY3JlYXRlO1xuZXhwb3J0cy51bmRlZmluZWQgPSB1bmRlZmluZWRUeXBlO1xuY29uc3QgbnVsbFR5cGUgPSBab2ROdWxsLmNyZWF0ZTtcbmV4cG9ydHMubnVsbCA9IG51bGxUeXBlO1xuY29uc3QgYW55VHlwZSA9IFpvZEFueS5jcmVhdGU7XG5leHBvcnRzLmFueSA9IGFueVR5cGU7XG5jb25zdCB1bmtub3duVHlwZSA9IFpvZFVua25vd24uY3JlYXRlO1xuZXhwb3J0cy51bmtub3duID0gdW5rbm93blR5cGU7XG5jb25zdCBuZXZlclR5cGUgPSBab2ROZXZlci5jcmVhdGU7XG5leHBvcnRzLm5ldmVyID0gbmV2ZXJUeXBlO1xuY29uc3Qgdm9pZFR5cGUgPSBab2RWb2lkLmNyZWF0ZTtcbmV4cG9ydHMudm9pZCA9IHZvaWRUeXBlO1xuY29uc3QgYXJyYXlUeXBlID0gWm9kQXJyYXkuY3JlYXRlO1xuZXhwb3J0cy5hcnJheSA9IGFycmF5VHlwZTtcbmNvbnN0IG9iamVjdFR5cGUgPSBab2RPYmplY3QuY3JlYXRlO1xuZXhwb3J0cy5vYmplY3QgPSBvYmplY3RUeXBlO1xuY29uc3Qgc3RyaWN0T2JqZWN0VHlwZSA9IFpvZE9iamVjdC5zdHJpY3RDcmVhdGU7XG5leHBvcnRzLnN0cmljdE9iamVjdCA9IHN0cmljdE9iamVjdFR5cGU7XG5jb25zdCB1bmlvblR5cGUgPSBab2RVbmlvbi5jcmVhdGU7XG5leHBvcnRzLnVuaW9uID0gdW5pb25UeXBlO1xuY29uc3QgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSA9IFpvZERpc2NyaW1pbmF0ZWRVbmlvbi5jcmVhdGU7XG5leHBvcnRzLmRpc2NyaW1pbmF0ZWRVbmlvbiA9IGRpc2NyaW1pbmF0ZWRVbmlvblR5cGU7XG5jb25zdCBpbnRlcnNlY3Rpb25UeXBlID0gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZTtcbmV4cG9ydHMuaW50ZXJzZWN0aW9uID0gaW50ZXJzZWN0aW9uVHlwZTtcbmNvbnN0IHR1cGxlVHlwZSA9IFpvZFR1cGxlLmNyZWF0ZTtcbmV4cG9ydHMudHVwbGUgPSB0dXBsZVR5cGU7XG5jb25zdCByZWNvcmRUeXBlID0gWm9kUmVjb3JkLmNyZWF0ZTtcbmV4cG9ydHMucmVjb3JkID0gcmVjb3JkVHlwZTtcbmNvbnN0IG1hcFR5cGUgPSBab2RNYXAuY3JlYXRlO1xuZXhwb3J0cy5tYXAgPSBtYXBUeXBlO1xuY29uc3Qgc2V0VHlwZSA9IFpvZFNldC5jcmVhdGU7XG5leHBvcnRzLnNldCA9IHNldFR5cGU7XG5jb25zdCBmdW5jdGlvblR5cGUgPSBab2RGdW5jdGlvbi5jcmVhdGU7XG5leHBvcnRzLmZ1bmN0aW9uID0gZnVuY3Rpb25UeXBlO1xuY29uc3QgbGF6eVR5cGUgPSBab2RMYXp5LmNyZWF0ZTtcbmV4cG9ydHMubGF6eSA9IGxhenlUeXBlO1xuY29uc3QgbGl0ZXJhbFR5cGUgPSBab2RMaXRlcmFsLmNyZWF0ZTtcbmV4cG9ydHMubGl0ZXJhbCA9IGxpdGVyYWxUeXBlO1xuY29uc3QgZW51bVR5cGUgPSBab2RFbnVtLmNyZWF0ZTtcbmV4cG9ydHMuZW51bSA9IGVudW1UeXBlO1xuY29uc3QgbmF0aXZlRW51bVR5cGUgPSBab2ROYXRpdmVFbnVtLmNyZWF0ZTtcbmV4cG9ydHMubmF0aXZlRW51bSA9IG5hdGl2ZUVudW1UeXBlO1xuY29uc3QgcHJvbWlzZVR5cGUgPSBab2RQcm9taXNlLmNyZWF0ZTtcbmV4cG9ydHMucHJvbWlzZSA9IHByb21pc2VUeXBlO1xuY29uc3QgZWZmZWN0c1R5cGUgPSBab2RFZmZlY3RzLmNyZWF0ZTtcbmV4cG9ydHMuZWZmZWN0ID0gZWZmZWN0c1R5cGU7XG5leHBvcnRzLnRyYW5zZm9ybWVyID0gZWZmZWN0c1R5cGU7XG5jb25zdCBvcHRpb25hbFR5cGUgPSBab2RPcHRpb25hbC5jcmVhdGU7XG5leHBvcnRzLm9wdGlvbmFsID0gb3B0aW9uYWxUeXBlO1xuY29uc3QgbnVsbGFibGVUeXBlID0gWm9kTnVsbGFibGUuY3JlYXRlO1xuZXhwb3J0cy5udWxsYWJsZSA9IG51bGxhYmxlVHlwZTtcbmNvbnN0IHByZXByb2Nlc3NUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcztcbmV4cG9ydHMucHJlcHJvY2VzcyA9IHByZXByb2Nlc3NUeXBlO1xuY29uc3QgcGlwZWxpbmVUeXBlID0gWm9kUGlwZWxpbmUuY3JlYXRlO1xuZXhwb3J0cy5waXBlbGluZSA9IHBpcGVsaW5lVHlwZTtcbmNvbnN0IG9zdHJpbmcgPSAoKSA9PiBzdHJpbmdUeXBlKCkub3B0aW9uYWwoKTtcbmV4cG9ydHMub3N0cmluZyA9IG9zdHJpbmc7XG5jb25zdCBvbnVtYmVyID0gKCkgPT4gbnVtYmVyVHlwZSgpLm9wdGlvbmFsKCk7XG5leHBvcnRzLm9udW1iZXIgPSBvbnVtYmVyO1xuY29uc3Qgb2Jvb2xlYW4gPSAoKSA9PiBib29sZWFuVHlwZSgpLm9wdGlvbmFsKCk7XG5leHBvcnRzLm9ib29sZWFuID0gb2Jvb2xlYW47XG5leHBvcnRzLmNvZXJjZSA9IHtcbiAgICBzdHJpbmc6ICgoYXJnKSA9PiBab2RTdHJpbmcuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIG51bWJlcjogKChhcmcpID0+IFpvZE51bWJlci5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgYm9vbGVhbjogKChhcmcpID0+IFpvZEJvb2xlYW4uY3JlYXRlKHtcbiAgICAgICAgLi4uYXJnLFxuICAgICAgICBjb2VyY2U6IHRydWUsXG4gICAgfSkpLFxuICAgIGJpZ2ludDogKChhcmcpID0+IFpvZEJpZ0ludC5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgZGF0ZTogKChhcmcpID0+IFpvZERhdGUuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxufTtcbmV4cG9ydHMuTkVWRVIgPSBwYXJzZVV0aWxfMS5JTlZBTElEO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHByaXNtYS9jbGllbnRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZhbGlkYXRvclwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9