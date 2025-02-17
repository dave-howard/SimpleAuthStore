const API_URL = "https://csjpqwui3eosyoqiwqpe2kwhym0selcn.lambda-url.eu-west-1.on.aws/";

/**
 * Makes an authenticated API request
 * @param {string} endpoint - API endpoint path
 * @param {Object} body - Request body
 * @returns {Promise<any>} Response data
 * @throws {Error} If the request fails
 */
async function makeApiRequest(endpoint, body) {
    try {
        const response = await fetch(API_URL + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        
        let data;
        try {
            data = await response.json();
        } catch (error) {
            // If JSON parsing fails, create a default error response
            data = {
                error: `HTTP ${response.status}: ${response.statusText}`,
                data: null
            };
        }
        
        if (!response.ok) {
            throw new Error(data.error || `API request to ${endpoint} failed with status ${response.status}`);
        }
        
        return data.data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Creates a new user account
 * @returns {Promise<string>} session_id
 * @throws {Error} If username or password is missing, or if signup fails
 */
async function signup(username, password) {
    
    if (!username || !password) {
        throw new Error('Username and password are required for signup');
    }
    
    return makeApiRequest("auth/signup", { username, password });
}

/**
 * Logs in an existing user
 * @returns {Promise<string>} session_id
 * @throws {Error} If username or password is missing, or if login fails
 */
async function login(username, password) {
    
    if (!username || !password) {
        throw new Error('Username and password are required for login');
    }
    
    return makeApiRequest("auth/login", { username, password });
}

/**
 * Reads user data for a specified username
 * @param {string} session_id - Active session ID
 * @returns {Promise<Object>} User data
 * @throws {Error} If session_id is missing or if read fails
 */
async function read_user(username,session_id) {
    if (!session_id) {
        throw new Error('Session ID is required to read user data');
    }

    if (!username) {
        throw new Error('Username is required to read user data');
    }

    return makeApiRequest("data/read", {
        session_id,
        item_key: 'USER',
        item_sort_key: username
    });
}

/**
 * Updates a user's public data
 * @param {string} session_id - Active session ID
 * @param {string} username - Username to update
 * @param {string} data - JSON string of public data to store
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If parameters are invalid or update fails
 */
async function write_user_public(session_id, username, data) {
    if (!session_id || !username || !data) {
        throw new Error('Session ID, username, and data are required for public data update');
    }

    let data_json;
    try {
        data_json = JSON.parse(data);
    } catch (error) {
        throw new Error('Invalid JSON data provided for public data update');
    }

    const user_data = {
        public_data: data_json,
        sort_key: username,
        key: "USER"
    };

    return makeApiRequest("data/update", {
        session_id,
        item_key: 'USER',
        item_sort_key: username,
        item: user_data
    });
}

/**
 * Updates a user's private data
 * @param {string} session_id - Active session ID
 * @param {string} username - Username to update
 * @param {string} data - JSON string of private data to store
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If parameters are invalid or update fails
 */
async function write_user_private(session_id, username, data) {
    if (!session_id || !username || !data) {
        throw new Error('Session ID, username, and data are required for private data update');
    }

    let data_json;
    try {
        data_json = JSON.parse(data);
    } catch (error) {
        throw new Error('Invalid JSON data provided for private data update');
    }

    const user_data = {
        private_data: data_json,
        sort_key: username,
        key: "USER"
    };

    return makeApiRequest("data/update", {
        session_id,
        item_key: 'USER',
        item_sort_key: username,
        item: user_data
    });
}

/**
 * Creates a new shared item
 * @param {string} session_id - Active session ID
 * @param {string} description - Item description
 * @returns {Promise<Object>} Created item data
 * @throws {Error} If parameters are invalid or creation fails
 */
async function create_shared_item(session_id, description) {
    if (!session_id || !description) {
        throw new Error('Session ID and description are required to create shared item');
    }

    return makeApiRequest("data/create_shared_item", {
        session_id,
        description
    });
}

/**
 * Retrieves all items owned by the current user
 * @param {string} session_id - Active session ID
 * @returns {Promise<Array>} List of owned items
 * @throws {Error} If session_id is invalid or retrieval fails
 */
async function read_owned_items(session_id) {
    if (!session_id) {
        throw new Error('Session ID is required to read owned items');
    }

    return makeApiRequest("data/read_owned_items", {
        session_id
    });
}

/**
 * Reads a specific shared item
 * @param {string} session_id - Active session ID
 * @param {string} shared_item_id - ID of the shared item to read
 * @returns {Promise<Object>} Shared item data
 * @throws {Error} If parameters are invalid or read fails
 */
async function read_shared_item(session_id, shared_item_id) {
    if (!shared_item_id) {
        throw new Error('Shared item ID is required to read shared item');
    }

    return makeApiRequest("data/read", {
        session_id,
        item_key: 'SHARED',
        item_sort_key: shared_item_id
    });
}

/**
 * Updates a shared item's data
 * @param {string} session_id - Active session ID
 * @param {string} shared_item_id - ID of the shared item to update
 * @param {string} data - JSON string of data to store
 * @returns {Promise<Object>} Updated shared item data
 * @throws {Error} If parameters are invalid or update fails
 */
async function update_shared_item(session_id, shared_item_id, data) {
    if (!session_id || !shared_item_id || !data) {
        throw new Error('Session ID, shared item ID, and data are required to update shared item');
    }

    let data_json;
    try {
        data_json = JSON.parse(data);
    } catch (error) {
        throw new Error('Invalid JSON data provided for shared item update');
    }

    const shared_item_data = {
        shared_data: data_json,
        sort_key: shared_item_id,
        key: "SHARED"
    };

    return makeApiRequest("data/update", {
        session_id,
        item_key: 'SHARED',
        item_sort_key: shared_item_id,
        item: shared_item_data
    });
}

/**
 * Manages access permissions for a shared item
 * @param {string} session_id - Active session ID
 * @param {string} subject_user_id - User to modify access for or 'ANYONE' to data public to all users
 * @param {string} shared_item_id - Item to modify access to
 * @param {string} action - Access action to perform (one of 'GRANT_READER', 'REVOKE_READER', 'GRANT_WRITER', 'REVOKE_WRITER', 'GRANT_OWNER', 'REVOKE_OWNER')
 * @returns {Promise<Object>} Updated access data
 * @throws {Error} If parameters are invalid or operation fails
 */
async function manage_access(session_id, subject_user_id, shared_item_id, action) {
    if (!session_id || !subject_user_id || !shared_item_id || !action) {
        throw new Error('Session ID, subject user ID, shared item ID, and action are required to manage access');
    }

    return makeApiRequest("data/manage_access", {
        session_id,
        subject_user_id,
        item_sort_key: shared_item_id,
        item_key: 'SHARED',
        action
    });
}
