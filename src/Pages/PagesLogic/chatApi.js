import axios from 'axios';

/**
 * Sends a message to the backend.
 * @param {string} message - The message to send
 * @param {string} conversationId - The ID of the conversation
 * @param {number} senderId - The ID of the message sender
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function sendMsgToBackend(message, conversationId, senderId) {
    try {
        const response = await axios.post(`http://localhost:9090/api/conversations/${conversationId}/send`, null, {
            params: {
                conversationId: conversationId,
                content: message,
                senderId: senderId,
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Appends additional text to an existing message in the backend.
 * @param {string} messageId - The ID of the message to append to
 * @param {string} message - The additional text to append
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function appendMsgToBackend(messageId, message) {
    try {
        const response = await axios.post(`http://localhost:9090/api/conversations/messages/${messageId}/addText`, null, {
            params: {
                messageId: messageId,
                additionalText: message,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Sends a message to the bot backend via stream.
 * @param {string} message - The message to send
 * @param conversationId - conversation I'd
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function sendMsgToBotBackendStream(message, conversationId) {
    const uuid = localStorage.getItem('uuid');
    try {
        await axios.get('http://localhost:9090/generateStream/model', {
            params: {
                message: message,
                uuid: uuid,
                modelName: "llama3",
                id: conversationId
            }
        });

        //return await axios.get('http://localhost:9090/generateStream/health');

    } catch (error) {
        console.error('Error sending message to backend:', error);
        throw error;
    }
}

/**
 * Sends a message with a file to the bot backend via stream.
 * @param {File} file - The file to send
 * @param {string} message - The message to send
 * @param id {conversationId}
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function sendMsgToBotBackendStreamFile(file, message, id) {
    const uuid = localStorage.getItem('uuid');
    try {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('document', file);
        formData.append('uuid', uuid);
        formData.append('id', id);

        const response = await axios.post('http://localhost:9090/generateStreamFromDocument/documentStream', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message with document to backend:', error);
        throw error;
    }
}


/**
 * Sends a message with an image to the bot backend via stream.
 * @param {File} image - The image to send
 * @param {string} message - The message to send
 * @param {string} id - The ID of the conversation
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function sendMsgToBotBackendStreamImage(image, message, id) {
    alert("NOT IMPLEMENTED YET");
}

/**
 * Sends a message with a URL to the bot backend.
 * @param {string} url - The URL to send
 * @param {string} message - The message to send
 * @param id {conversationId}
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function sendMsgToBotBackendStreamUrl(url, message, id) {
    const uuid = localStorage.getItem('uuid');
    try {
        const response = await axios.get('http://localhost:9090/generateStreamFromURL/url', {
            params: {
                message: message,
                urlPath: url,
                uuid: uuid,
                id: id
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message with URL to backend:', error);
        throw error;
    }
}

/**
 * Sends a message to the bot backend.
 * @param {string} message - The message to send
 * @param {string} id - The ID of the conversation
 * @returns {Promise<any>} A Promise that resolves with the response data
 */
export async function sendMsgToBotBackend(message) {
    try {
        const uuid = localStorage.getItem('uuid');

        const response = await axios.get('http://localhost:9090/generateText/WholeText', {
            params: {
                message: message,
                uuid: uuid
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message to backend:', error);
        throw error;
    }
}

/**
 * Initializes the program by retrieving conversation IDs associated with a UUID.
 * @param {string} uuid - The UUID
 * @returns {Promise<string[] | null>} A Promise that resolves with an array of conversation IDs, or null if there was an error
 */
export async function initializeProgram(uuid) {
    try {
        const response = await axios.get(`http://localhost:9090/api/conversations/getByOwnerId`, {
            params: {
                ownerId: uuid
            }
        });

        return response.data.map(conversation => conversation.id);
    } catch (error) {
        console.error('Error initializing program:', error);
        return null;
    }
}

/**
 * Fetches a conversation by its ID.
 * @param {string} id - The ID of the conversation to fetch
 * @returns {Promise<any>} A Promise that resolves with the conversation data
 */
export async function fetchConversationById(id) {
    try {
        const response = await axios.get(`http://localhost:9090/api/conversations/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
}

/**
 * Starts a new conversation.
 * @param {string} ownerId - The ID of the conversation owner
 * @returns {Promise<string>} A Promise that resolves with the ID of the new conversation
 */
export async function startNewConversation(ownerId) {
    try {
        const response = await axios.post('http://localhost:9090/api/conversations/start', null, {
            params: {
                ownerId: ownerId
            }
        });
        return response.data.id;
    } catch (error) {
        console.error('Error starting new conversation:', error);
        throw error;
    }
}
