import axios from 'axios';

export async function sendMsgToBackend(message, conversationId, senderId) {
    try {
        const response = await axios.post(`http://localhost:8080/api/conversations/${conversationId}/send`, null, {
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

export async function sendMsgToBotBackend(message) {
    try {
        const response = await axios.post('http://localhost:8081/test/response', null, {
            params: {
                message: message
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message to bot backend:', error);
        throw error;
    }
}

export async function initializeProgram(uuid) {
    try {
        console.log(uuid);
        const response = await axios.get(`http://localhost:8080/api/conversations/getByOwnerId`, {
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

export async function fetchConversationById(id) {
    try {
        const response = await axios.get(`http://localhost:8080/api/conversations/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
}

export async function startNewConversation(ownerId) {
    try {
        const response = await axios.post('http://localhost:8080/api/conversations/start', null, {
            params: {
                ownerId: ownerId
            }
        });
        return response.data.id;
    } catch (error) {
        console.error('Error starting new conversation:', error);
        console.log('Response:', error.response);
        throw error;
    }
}