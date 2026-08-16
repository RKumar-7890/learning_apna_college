/* =========================================================
   EDUMANAGE SCHOOL MANAGEMENT SYSTEM
   Authentication + Registration + Role Based Access
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const USERS_KEY = "edumanage_users";
const SESSION_KEY = "edumanage_session";


/* =========================================================
   USER ROLES AND PERMISSIONS
   ========================================================= */

const ROLE_PERMISSIONS = {

    Administrator: [
        "dashboard",
        "students",
        "fees",
        "progress",
        "faculty",
        "programs",
        "udise",
        "contacts",
        "attendance",
        "reports",
        "admissions",
        "examinations",
        "classes",
        "documents",
        "settings"
    ],

    Principal: [
        "dashboard",
        "students",
        "fees",
        "progress",
        "faculty",
        "programs",
        "udise",
        "contacts",
        "attendance",
        "reports",
        "admissions",
        "examinations",
        "classes",
        "documents"
    ],

    Teacher: [
        "dashboard",
        "students",
        "progress",
        "programs",
        "contacts",
        "attendance",
        "examinations",
        "classes",
        "documents"
    ],

    Accountant: [
        "dashboard",
        "students",
        "fees",
        "contacts",
        "reports"
    ],

    "Data Entry Operator": [
        "dashboard",
        "students",
        "contacts",
        "attendance",
        "admissions",
        "classes",
        "documents"
    ]
};


/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

const DEFAULT_USER_ROLE = "Data Entry Operator";


/* =========================================================
   GET USERS
   ========================================================= */

function getUsers() {

    try {

        const storedUsers =
            localStorage.getItem(USERS_KEY);

        if (!storedUsers) {
            return [];
        }

        return JSON.parse(storedUsers);

    } catch (error) {

        console.error(
            "Error reading users:",
            error
        );

        return [];
    }
}


/* =========================================================
   SAVE USERS
   ========================================================= */

function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


/* =========================================================
   GET SESSION
   ========================================================= */

function getSession() {

    try {

        const session =
            sessionStorage.getItem(
                SESSION_KEY
            );

        if (!session) {
            return null;
        }

        return JSON.parse(session);

    } catch (error) {

        console.error(
            "Error reading session:",
            error
        );

        return null;
    }
}


/* =========================================================
   SAVE SESSION
   ========================================================= */

function saveSession(user) {

    const session = {

        userId: user.username,

        name: user.name,

        role: user.role,

        loginTime:
            new Date().toISOString()
    };

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    sessionStorage.removeItem(
        SESSION_KEY
    );

    showLoginPage();

    const password =
        document.getElementById(
            "loginPassword"
        );

    if (password) {
        password.value = "";
    }

    showToast(
        "You have been logged out."
    );
}


/* =========================================================
   PASSWORD HASH
   ========================================================= */

/*
   This is a frontend prototype.

   IMPORTANT:
   For production, passwords must be hashed
   on the backend using bcrypt/Argon2/etc.
*/

function hashPassword(password) {

    let hash = 0;

    for (
        let i = 0;
        i < password.length;
        i++
    ) {

        const character =
            password.charCodeAt(i);

        hash =
            ((hash << 5) - hash)
            + character;

        hash |= 0;
    }

    return String(hash);
}


/* =========================================================
   REGISTER USER
   ========================================================= */

function registerUser(
    name,
    username,
    password,
    confirmPassword,
    role
) {

    name =
        name.trim();

    username =
        username.trim();


    /* Required fields */

    if (
        !name ||
        !username ||
        !password ||
        !confirmPassword ||
        !role
    ) {

        return {
            success: false,
            message:
                "Please fill in all required fields."
        };
    }


    /* User ID validation */

    if (username.length < 4) {

        return {
            success: false,
            message:
                "User ID must contain at least 4 characters."
        };
    }


    if (
        !/^[a-zA-Z0-9._-]+$/.test(
            username
        )
    ) {

        return {
            success: false,
            message:
                "User ID can contain letters, numbers, dots, hyphens and underscores only."
        };
    }


    /* Password validation */

    if (password.length < 6) {

        return {
            success: false,
            message:
                "Password must contain at least 6 characters."
        };
    }


    /* Confirm password */

    if (
        password !==
        confirmPassword
    ) {

        return {
            success: false,
            message:
                "Passwords do not match."
        };
    }


    /* Validate role */

    if (
        !ROLE_PERMISSIONS[role]
    ) {

        return {
            success: false,
            message:
                "Invalid user type selected."
        };
    }


    const users =
        getUsers();


    /* Check duplicate ID */

    const existingUser =
        users.find(
            user =>
                user.username.toLowerCase()
                ===
                username.toLowerCase()
        );


    if (existingUser) {

        return {
            success: false,
            message:
                "This User ID already exists."
        };
    }


    /* Create user */

    const newUser = {

        id:
            Date.now(),

        name:
            name,

        username:
            username,

        password:
            hashPassword(password),

        role:
            role,

        createdAt:
            new Date().toISOString()
    };


    users.push(
        newUser
    );

    saveUsers(
        users
    );


    return {

        success: true,

        user:
            newUser
    };
}


/* =========================================================
   LOGIN USER
   ========================================================= */

function loginUser(
    username,
    password
) {

    username =
        username.trim();


    if (
        !username ||
        !password
    ) {

        return {

            success: false,

            message:
                "Please enter User ID and Password."
        };
    }


    const users =
        getUsers();


    const user =
        users.find(
            account =>
                account.username.toLowerCase()
                ===
                username.toLowerCase()
        );


    /* User does not exist */

    if (!user) {

        return {

            success: false,

            message:
                "User ID not found. Please register first."
        };
    }


    /* Check password */

    const passwordHash =
        hashPassword(
            password
        );


    if (
        user.password !==
        passwordHash
    ) {

        return {

            success: false,

            message:
                "Incorrect password."
        };
    }


    /* Create session */

    saveSession(
        user
    );


    return {

        success: true,

        user:
            user
    };
}


/* =========================================================
   INITIALIZE AUTHENTICATION UI
   ========================================================= */

function initializeAuthentication() {

    createLoginPageIfRequired();

    setupLoginForm();

    setupRegistrationForm();

    setupAuthSwitching();

    setupPasswordToggle();

    setupLogout();

    checkAuthentication();
}


/* =========================================================
   CREATE LOGIN PAGE
   ========================================================= */

function createLoginPageIfRequired() {

    if (
        document.getElementById(
            "authScreen"
        )
    ) {

        return;
    }


    const authScreen =
        document.createElement(
            "div"
        );


    authScreen.id =
        "authScreen";

    authScreen.className =
        "auth-screen";


    authScreen.innerHTML = `

        <div class="auth-container">

            <!-- LOGIN -->

            <div
                id="loginPanel"
                class="auth-panel"
            >

                <div class="auth-logo">

                    <div class="school-logo">
                        EM
                    </div>

                </div>

                <h1>
                    EduManage
                </h1>

                <p class="auth-subtitle">
                    School Management System
                </p>


                <form id="loginForm">

                    <div class="form-group">

                        <label>
                            User ID
                        </label>

                        <input
                            type="text"
                            id="loginUsername"
                            placeholder="Enter User ID"
                            autocomplete="username"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Password
                        </label>

                        <div class="password-wrapper">

                            <input
                                type="password"
                                id="loginPassword"
                                placeholder="Enter Password"
                                autocomplete="current-password"
                                required
                            >

                            <button
                                type="button"
                                class="show-password"
                                data-target="loginPassword"
                            >
                                Show
                            </button>

                        </div>

                    </div>


                    <div
                        id="loginError"
                        class="auth-message error"
                    ></div>


                    <button
                        type="submit"
                        class="auth-button"
                    >
                        Login
                    </button>

                </form>


                <div class="auth-divider">
                    <span>
                        New user?
                    </span>
                </div>


                <button
                    type="button"
                    id="showRegister"
                    class="secondary-auth-button"
                >
                    Create New Account
                </button>

            </div>


            <!-- REGISTER -->

            <div
                id="registerPanel"
                class="auth-panel"
                style="display:none;"
            >

                <div class="auth-logo">

                    <div class="school-logo">
                        EM
                    </div>

                </div>


                <h1>
                    Create Account
                </h1>


                <p class="auth-subtitle">
                    Register to access EduManage
                </p>


                <form id="registerForm">


                    <div class="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            id="registerName"
                            placeholder="Enter full name"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Create User ID
                        </label>

                        <input
                            type="text"
                            id="registerUsername"
                            placeholder="Create User ID"
                            minlength="4"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Create Password
                        </label>

                        <div class="password-wrapper">

                            <input
                                type="password"
                                id="registerPassword"
                                placeholder="Create Password"
                                minlength="6"
                                required
                            >

                            <button
                                type="button"
                                class="show-password"
                                data-target="registerPassword"
                            >
                                Show
                            </button>

                        </div>

                    </div>


                    <div class="form-group">

                        <label>
                            Confirm Password
                        </label>

                        <div class="password-wrapper">

                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                minlength="6"
                                required
                            >

                            <button
                                type="button"
                                class="show-password"
                                data-target="confirmPassword"
                            >
                                Show
                            </button>

                        </div>

                    </div>


                    <div class="form-group">

                        <label>
                            User Type
                        </label>

                        <select
                            id="registerRole"
                            required
                        >

                            <option value="">
                                Select User Type
                            </option>

                            <option value="Administrator">
                                Administrator
                            </option>

                            <option value="Principal">
                                Principal
                            </option>

                            <option value="Teacher">
                                Teacher
                            </option>

                            <option value="Accountant">
                                Accountant
                            </option>

                            <option value="Data Entry Operator">
                                Data Entry Operator
                            </option>

                        </select>

                    </div>


                    <div
                        id="registerError"
                        class="auth-message error"
                    ></div>


                    <div
                        id="registerSuccess"
                        class="auth-message success"
                    ></div>


                    <button
                        type="submit"
                        class="auth-button"
                    >
                        Create Account
                    </button>

                </form>


                <div class="auth-divider">
                    <span>
                        Already registered?
                    </span>
                </div>


                <button
                    type="button"
                    id="showLogin"
                    class="secondary-auth-button"
                >
                    Back to Login
                </button>

            </div>

        </div>
    `;


    document.body.prepend(
        authScreen
    );
}


/* =========================================================
   LOGIN FORM
   ========================================================= */

function setupLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "loginUsername"
                ).value;


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const result =
                loginUser(
                    username,
                    password
                );


            const error =
                document.getElementById(
                    "loginError"
                );


            if (!result.success) {

                showAuthMessage(
                    error,
                    result.message,
                    "error"
                );

                return;
            }


            /* Login successful */

            hideLoginPage();

            updateUserInterface(
                result.user
            );

            applyRolePermissions(
                result.user.role
            );


            form.reset();


            showToast(
                "Welcome " +
                result.user.name
            );
        }
    );
}


/* =========================================================
   REGISTRATION FORM
   ========================================================= */

function setupRegistrationForm() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "registerName"
                ).value;


            const username =
                document.getElementById(
                    "registerUsername"
                ).value;


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const role =
                document.getElementById(
                    "registerRole"
                ).value;


            const result =
                registerUser(
                    name,
                    username,
                    password,
                    confirmPassword,
                    role
                );


            const error =
                document.getElementById(
                    "registerError"
                );


            const success =
                document.getElementById(
                    "registerSuccess"
                );


            if (!result.success) {

                showAuthMessage(
                    error,
                    result.message,
                    "error"
                );

                return;
            }


            error.classList.remove(
                "show"
            );


            showAuthMessage(
                success,
                "Account created successfully. Please login.",
                "success"
            );


            form.reset();


            setTimeout(
                function() {

                    showLoginPanel();


                    const loginUsername =
                        document.getElementById(
                            "loginUsername"
                        );


                    if (loginUsername) {

                        loginUsername.value =
                            result.user.username;

                        loginUsername.focus();
                    }

                },
                1200
            );
        }
    );
}


/* =========================================================
   LOGIN / REGISTER SWITCH
   ========================================================= */

function setupAuthSwitching() {

    const showRegister =
        document.getElementById(
            "showRegister"
        );


    const showLogin =
        document.getElementById(
            "showLogin"
        );


    if (showRegister) {

        showRegister.addEventListener(
            "click",
            function() {

                showRegisterPanel();

            }
        );
    }


    if (showLogin) {

        showLogin.addEventListener(
            "click",
            function() {

                showLoginPanel();

            }
        );
    }
}


/* =========================================================
   SHOW LOGIN PANEL
   ========================================================= */

function showLoginPanel() {

    const loginPanel =
        document.getElementById(
            "loginPanel"
        );


    const registerPanel =
        document.getElementById(
            "registerPanel"
        );


    if (loginPanel) {

        loginPanel.style.display =
            "block";
    }


    if (registerPanel) {

        registerPanel.style.display =
            "none";
    }


    clearAuthMessages();
}


/* =========================================================
   SHOW REGISTER PANEL
   ========================================================= */

function showRegisterPanel() {

    const loginPanel =
        document.getElementById(
            "loginPanel"
        );


    const registerPanel =
        document.getElementById(
            "registerPanel"
        );


    if (loginPanel) {

        loginPanel.style.display =
            "none";
    }


    if (registerPanel) {

        registerPanel.style.display =
            "block";
    }


    clearAuthMessages();
}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

function setupPasswordToggle() {

    document
        .querySelectorAll(
            ".show-password"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        const target =
                            document.getElementById(
                                this.dataset.target
                            );


                        if (!target) {
                            return;
                        }


                        if (
                            target.type ===
                            "password"
                        ) {

                            target.type =
                                "text";

                            this.textContent =
                                "Hide";

                        } else {

                            target.type =
                                "password";

                            this.textContent =
                                "Show";
                        }
                    }
                );
            }
        );
}


/* =========================================================
   SHOW AUTH MESSAGE
   ========================================================= */

function showAuthMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "auth-message " +
        type +
        " show";
}


/* =========================================================
   CLEAR AUTH MESSAGES
   ========================================================= */

function clearAuthMessages() {

    document
        .querySelectorAll(
            ".auth-message"
        )
        .forEach(
            element => {

                element.textContent =
                    "";

                element.classList.remove(
                    "show"
                );
            }
        );
}


/* =========================================================
   CHECK AUTHENTICATION
   ========================================================= */

function checkAuthentication() {

    const session =
        getSession();


    if (!session) {

        showLoginPage();

        return false;
    }


    hideLoginPage();


    updateUserInterface(
        session
    );


    applyRolePermissions(
        session.role
    );


    return true;
}


/* =========================================================
   SHOW LOGIN PAGE
   ========================================================= */

function showLoginPage() {

    const authScreen =
        document.getElementById(
            "authScreen"
        );


    const application =
        getApplicationContainer();


    if (authScreen) {

        authScreen.style.display =
            "flex";
    }


    if (application) {

        application.style.display =
            "none";
    }
}


/* =========================================================
   HIDE LOGIN PAGE
   ========================================================= */

function hideLoginPage() {

    const authScreen =
        document.getElementById(
            "authScreen"
        );


    const application =
        getApplicationContainer();


    if (authScreen) {

        authScreen.style.display =
            "none";
    }


    if (application) {

        application.style.display =
            "";
    }
}


/* =========================================================
   FIND EXISTING APPLICATION
   ========================================================= */

function getApplicationContainer() {

    /*
       Your existing HTML does not need to be
       completely rebuilt.

       This function detects the main EduManage
       dashboard automatically.
    */


    const possibleContainers = [

        "#schoolApp",

        ".school-app",

        ".app",

        ".dashboard-app",

        ".main",

        "main"

    ];


    for (
        const selector
        of possibleContainers
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (element) {

            return element;
        }
    }


    return null;
}


/* =========================================================
   UPDATE USER INFORMATION
   ========================================================= */

function updateUserInterface(user) {

    if (!user) {
        return;
    }


    /* Existing profile name */

    const profileNames = [

        "#loggedUserName",

        "#currentUser",

        "#userName",

        ".profile-info strong"

    ];


    profileNames.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if (element) {

                element.textContent =
                    user.name;
            }
        }
    );


    /* Existing profile role */

    const profileRoles = [

        "#loggedUserRole",

        "#userRole",

        ".profile-info small"

    ];


    profileRoles.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if (element) {

                element.textContent =
                    user.role;
            }
        }
    );


    /* Avatar initials */

    const avatars =
        document.querySelectorAll(
            ".avatar"
        );


    avatars.forEach(
        avatar => {

            const initials =
                getInitials(
                    user.name
                );


            avatar.textContent =
                initials;
        }
    );
}


/* =========================================================
   GET USER INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {
        return "U";
    }


    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0)
                    .toUpperCase()
        )
        .join("");
}


/* =========================================================
   ROLE BASED ACCESS
   ========================================================= */

function applyRolePermissions(role) {

    const allowedSections =
        ROLE_PERMISSIONS[role];


    if (!allowedSections) {
        return;
    }


    /* Find all navigation links */

    const navigationLinks =
        document.querySelectorAll(
            ".nav-link[data-section]"
        );


    navigationLinks.forEach(
        link => {

            const section =
                link.dataset.section;


            if (
                allowedSections.includes(
                    section
                )
            ) {

                link.style.display =
                    "";

                link.classList.remove(
                    "restricted-link"
                );

            } else {

                link.style.display =
                    "none";

                link.classList.add(
                    "restricted-link"
                );
            }
        }
    );


    /* Protect pages themselves */

    document
        .querySelectorAll(
            ".page[id]"
        )
        .forEach(
            page => {

                const section =
                    page.id;


                if (
                    allowedSections.includes(
                        section
                    )
                ) {

                    page.dataset.allowed =
                        "true";

                } else {

                    page.dataset.allowed =
                        "false";
                }
            }
        );
}


/* =========================================================
   CHECK SECTION PERMISSION
   ========================================================= */

function hasPermission(
    section
) {

    const session =
        getSession();


    if (!session) {
        return false;
    }


    const permissions =
        ROLE_PERMISSIONS[
            session.role
        ] || [];


    return permissions.includes(
        section
    );
}


/* =========================================================
   PROTECTED NAVIGATION
   ========================================================= */

function setupProtectedNavigation() {

    document
        .querySelectorAll(
            ".nav-link[data-section]"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function(event) {

                        const section =
                            this.dataset.section;


                        const session =
                            getSession();


                        /* No login */

                        if (!session) {

                            event.preventDefault();

                            showLoginPage();

                            return;
                        }


                        /* Permission denied */

                        if (
                            !hasPermission(
                                section
                            )
                        ) {

                            event.preventDefault();


                            showToast(
                                "You do not have permission to access this section."
                            );


                            return;
                        }
                    }
                );
            }
        );
}


/* =========================================================
   LOGOUT SETUP
   ========================================================= */

function setupLogout() {

    /*
       Supports an existing logout button
       as well as the new authentication system.
    */

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "#logoutButton, .logout-button, [data-action='logout']"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            logoutUser();
        }
    );
}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "systemToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "systemToast";


        toast.style.position =
            "fixed";

        toast.style.bottom =
            "25px";

        toast.style.right =
            "25px";

        toast.style.zIndex =
            "999999";

        toast.style.padding =
            "12px 18px";

        toast.style.background =
            "#172033";

        toast.style.color =
            "#ffffff";

        toast.style.borderRadius =
            "9px";

        toast.style.fontSize =
            "13px";

        toast.style.fontWeight =
            "600";

        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.20)";


        document.body.appendChild(
            toast
        );
    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            function() {

                toast.style.display =
                    "none";

            },
            3000
        );
}


/* =========================================================
   PROTECT DASHBOARD
   ========================================================= */

function requireLogin() {

    const session =
        getSession();


    if (!session) {

        showLoginPage();

        return false;
    }


    return true;
}


/* =========================================================
   PROTECT SPECIFIC SECTION
   ========================================================= */

function requirePermission(
    section
) {

    if (!requireLogin()) {
        return false;
    }


    if (
        !hasPermission(
            section
        )
    ) {

        showToast(
            "Access denied for your user type."
        );

        return false;
    }


    return true;
}


/* =========================================================
   INITIALIZE EXISTING NAVIGATION
   ========================================================= */

/*
   This section works with the navigation
   already present in your EduManage HTML:

   data-section="dashboard"
   data-section="students"
   data-section="fees"
   data-section="progress"
   etc.
*/

function initializeNavigation() {

    const links =
        document.querySelectorAll(
            ".nav-link[data-section]"
        );


    const pages =
        document.querySelectorAll(
            ".page"
        );


    if (!links.length) {
        return;
    }


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    if (
                        !requireLogin()
                    ) {
                        return;
                    }


                    const section =
                        this.dataset.section;


                    if (
                        !hasPermission(
                            section
                        )
                    ) {

                        showToast(
                            "You do not have permission to access this section."
                        );

                        return;
                    }


                    /* Remove active */

                    links.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );
                        }
                    );


                    /* Activate clicked */

                    this.classList.add(
                        "active"
                    );


                    /* Hide pages */

                    pages.forEach(
                        page => {

                            page.classList.remove(
                                "active-page"
                            );

                            page.style.display =
                                "none";
                        }
                    );


                    /* Show selected page */

                    const selectedPage =
                        document.getElementById(
                            section
                        );


                    if (
                        selectedPage
                    ) {

                        selectedPage.classList.add(
                            "active-page"
                        );

                        selectedPage.style.display =
                            "block";
                    }


                    /* Update heading */

                    updatePageHeading(
                        section
                    );
                }
            );
        }
    );
}


/* =========================================================
   UPDATE PAGE HEADING
   ========================================================= */

function updatePageHeading(
    section
) {

    const titles = {

        dashboard:
            "Dashboard",

        students:
            "Students",

        fees:
            "Fees Management",

        progress:
            "Student Progress",

        faculty:
            "Faculty",

        programs:
            "School Programs",

        udise:
            "UDISE",

        contacts:
            "Contact",

        attendance:
            "Attendance",

        reports:
            "Reports",

        admissions:
            "Admissions",

        examinations:
            "Examinations",

        classes:
            "Classes",

        documents:
            "Documents",

        settings:
            "Settings"
    };


    const heading =
        document.querySelector(
            ".page-heading h1"
        );


    if (
        heading &&
        titles[section]
    ) {

        heading.textContent =
            titles[section];
    }
}


/* =========================================================
   APPLICATION INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Authentication must be initialized
           first.
        */

        initializeAuthentication();


        /*
           Existing EduManage navigation
        */

        initializeNavigation();


        /*
           Additional protection
        */

        setupProtectedNavigation();


        /*
           Apply current user's permissions
           after navigation has loaded.
        */

        const session =
            getSession();


        if (session) {

            applyRolePermissions(
                session.role
            );
        }

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.EduManageAuth = {

    getUsers,

    registerUser,

    loginUser,

    logoutUser,

    getSession,

    hasPermission,

    requireLogin,

    requirePermission,

    applyRolePermissions

};