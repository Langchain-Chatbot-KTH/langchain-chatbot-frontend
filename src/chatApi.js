import axios from 'axios';

export async function sendMsgToBackend(message, conversationId, senderId) {
    try {
        const response = await axios.post(`http://localhost:8082/api/conversations/${conversationId}/send`, null, {
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

export async function appendMsgToBackend(messageId, message) {
    try {
        const response = await axios.post(`http://localhost:8082/api/conversations/messages/${messageId}/addText`, null, {
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


export async function sendMsgToBotBackendStream(message, id) {

    const uuid = localStorage.getItem('uuid');
    const conversation = await fetchConversationById(id);

    const previousBotMessages = conversation.messages
        .filter(message => message.senderId === 0)
        .map(botMessage => "Previous Bot Message: " + botMessage.content);

    const messageToSend = previousBotMessages.join('\n') + '\nUser:' + message;

    try {
        axios.get('http://localhost:9090/generateStream/model', {
            params: {
                message: messageToSend,
                model: "mistral",
                uuid: uuid
            }
        });

        return await axios.get('http://localhost:9090/generateStream/health');

    } catch (error) {
        console.error('Error sending message to backend:', error);
        throw error;
    }
}

export async function sendMsgToBotBackend(message, id) {
    try {

        const uuid = localStorage.getItem('uuid');
        const conversation = await fetchConversationById(id);

        const previousBotMessages = conversation.messages
            .filter(message => message.senderId === 0)
            .map(botMessage => "Previous Bot Message: " + botMessage.content);

        const messageToSend = previousBotMessages.join('\n') + '\nLatest Message From User: ' + message;

        const response = await axios.get('http://localhost:9090/generateText/WholeText', {
            params: {
                message: messageToSend,
                modelName: "phi",
                uuid: uuid
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending message to backend:', error);
        throw error;
    }
}



export async function initializeProgram(uuid) {
    try {
        const response = await axios.get(`http://localhost:8082/api/conversations/getByOwnerId`, {
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
        const response = await axios.get(`http://localhost:8082/api/conversations/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
}

export async function startNewConversation(ownerId) {
    try {
        const response = await axios.post('http://localhost:8082/api/conversations/start', null, {
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