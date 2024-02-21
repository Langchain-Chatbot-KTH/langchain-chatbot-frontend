// api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/conversations';
const OPEN_SOURCE_UUID_API = 'https://www.uuidtools.com/api/generate/v4';

const checkUUIDInLocalStorage = () => {
    return localStorage.getItem('uuid');
};

const checkUUIDOnBackend = async (uuid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/hasConversations?ownerId=${uuid}`);
        return response.data.hasConversations;
    } catch (error) {
        console.error('Error checking UUID on the backend:', error);
        throw error;
    }
};
const getUUIDFromOpenSourceAPI = async () => {
    try {
        const response = await axios.get(OPEN_SOURCE_UUID_API);
        return response.data[0]; // Extract the UUID from the response array
    } catch (error) {
        console.error('Error getting UUID from open-source API:', error);
        throw error;
    }
};
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
