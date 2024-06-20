/**
 * API functions for managing UUID and conversations.
 * @module api
 */

import axios from 'axios';

/**
 * The base URL for the API.
 * @constant {string}
 */
const API_BASE_URL = 'https://proxyembedding.vm-app.cloud.cbh.kth.se/api/conversations';
//const API_BASE_URL = 'http://localhost:9090/api/conversations';

/**
 * The API endpoint for generating a new UUID from an open-source API.
 * @constant {string}
 */
const OPEN_SOURCE_UUID_API = 'https://www.uuidtools.com/api/generate/v4';

/**
 * Checks if UUID is stored in local storage.
 * @returns {string | null} The UUID stored in local storage, or null if not found
 */
const checkUUIDInLocalStorage = () => {
    return localStorage.getItem('uuid');
};

/**
 * Checks if UUID exists on the backend.
 * @param {string} uuid - The UUID to check
 * @returns {Promise<boolean>} A Promise that resolves to true if UUID exists on the backend, otherwise false
 */
const checkUUIDOnBackend = async (uuid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/hasConversations?ownerId=${uuid}`);
        return response.data.hasConversations;
    } catch (error) {
        console.error('Error checking UUID on the backend:', error);
        throw error;
    }
};

/**
 * Gets a new UUID from an open-source API.
 * @returns {Promise<string>} A Promise that resolves to the new UUID
 */
const getUUIDFromOpenSourceAPI = async () => {
    try {
        const response = await axios.get(OPEN_SOURCE_UUID_API);
        return response.data[0]; // Extract the UUID from the response array
    } catch (error) {
        console.error('Error getting UUID from open-source API:', error);
        throw error;
    }
};

/**
 * Gets a new UUID from the backend if available, otherwise generates a new one.
 * @returns {Promise<string>} A Promise that resolves to the new or existing UUID
 */
const getNewUUIDFromBackend = async () => {
    const storedUUID = checkUUIDInLocalStorage();

    if (storedUUID) {
        const isUUIDOnBackend = await checkUUIDOnBackend(storedUUID);

        if (isUUIDOnBackend) {
            return storedUUID;
        } else {
            return storedUUID;
        }
    }

    const newUUID = await getUUIDFromOpenSourceAPI();
    localStorage.setItem('uuid', newUUID);

    return newUUID;
};

/**
 * Initializes the UUID by retrieving an existing one from the backend or generating a new one.
 * @returns {Promise<string>} A Promise that resolves to the initialized UUID
 */
const initializeUUID = async () => {
    try {
        const uuid = await getNewUUIDFromBackend();
        if (uuid) {
            return uuid;
        } else {
            return checkUUIDInLocalStorage();
        }
    } catch (error) {
        console.error('Error initializing UUID:', error);
        throw error;
    }
};

export { initializeUUID };
