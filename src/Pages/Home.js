import React, { useEffect, useState } from 'react';
import './PagesStyle/HomeStyle.css';
import msgIcon from '../assets/message.svg';
import home from '../assets/home.svg';
import saved from '../assets/bookmark.svg';
import rocket from '../assets/rocket.svg';
import sendBtn from '../assets/send.svg';
import userIcon from '../assets/TansparentPerson.png';
import imageLogo from '../assets/image_logo_medium.png';
import {
    sendMsgToBackend,
    initializeProgram,
    fetchConversationById,
    startNewConversation,
    sendMsgToBotBackendStream, appendMsgToBackend
} from '../chatApi';
import { initializeUUID } from "./UUID";
import { Link } from "react-router-dom";

function Home() {
    const [input, setInput] = useState('');
    const [firstIds, setFirstIds] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isConversationEmpty, setIsConversationEmpty] = useState(true);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                const uuid = await initializeUUID();
                const ids = await initializeProgram(uuid);

                if (!ids || ids.length === 0) {
                    const newConversationId = await startNewConversation(uuid);
                    setFirstIds([newConversationId]);
                    await handleQueryClick(newConversationId);
                } else {
                    setFirstIds(ids);
                    const lastIndex = ids.length - 1;
                    await handleQueryClick(ids[lastIndex]);
                }
            } catch (error) {
                console.error('Error initializing UUID:', error);
            }
        };

        initialize();
    }, []);

    const handleSend = async () => {
        const text = input;
        if (selectedConversation) {
            try {
                setIsSending(true);
                await sendMsgToBackend(text, selectedConversation.id, 1);
                setInput('');
                await handleQueryClick(selectedConversation.id);

                if (selectedConversation.messages.length <= 1) {
                    await fetchQueryNames();
                }
                const response = await sendMsgToBotBackendStream(text, selectedConversation.id);
                if (response.data === "Running"){
                    handleStream(selectedConversation.id);
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.error('No conversation selected to send a message to.');
        }
    };

    const handleStream = async (conversationId) => {
        const uuid = localStorage.getItem('uuid');
        const source = new EventSource(`http://localhost:9090/subscribe/${uuid}`);
        const response = await sendMsgToBackend("", selectedConversation.id, 0);

        source.onmessage = async (event) => {
            const token = event.data;
            if (token === "#FC9123CFAA1953123#") {
                console.log("Stream Completed");
                source.close();
                setIsSending(false);
            } else {
                const lastMessageId = response.messages[response.messages.length - 1].id;
                await appendMsgToBackend(lastMessageId, token);
                await handleQueryClick(selectedConversation.id);
                }
            }

        source.onerror = (error) => {
            console.error('SSE Error:', error);
        };
    }


    const sendSequenceToBackend = async (sequence, conversationId) => {
        try {
            await sendMsgToBackend(sequence, conversationId, 0);
        } catch (error) {
            console.error('Error sending sequence to backend:', error);
        }
    };

    const handleQueryClick = async (id) => {
        try {
            const conversation = await fetchConversationById(id);
            setSelectedConversation(conversation);
            setIsConversationEmpty(conversation.messages.length === 0);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const handleNewChat = async () => {
        try {
            const uuid = await initializeUUID();
            const newConversationId = await startNewConversation(uuid);
            setFirstIds((prevIds) => [...prevIds, newConversationId]);
            await handleQueryClick(newConversationId);
        } catch (error) {
            console.error('Error starting new chat:', error);
        }
    };

    const [queryNames, setQueryNames] = useState([]);

    const fetchQueryNames = async () => {
        try {
            if (!firstIds) {
                console.warn('firstIds is null. Skipping fetchQueryNames.');
                return;
            }

            const names = await Promise.all(
                firstIds.slice().reverse().map(async (id) => {
                    let queryName = 'New Conversation';
                    if (id !== 'new') {
                        try {
                            const conversation = await fetchConversationById(id);
                            const firstUserMessage = conversation.messages.find(message => message.senderId !== 0);
                            if (firstUserMessage) {
                                queryName = firstUserMessage.content.slice(0, 25) + (firstUserMessage.content.length > 5 ? '...' : '');
                            }
                        } catch (error) {
                            console.error('Error fetching conversation:', error);
                        }
                    }
                    return queryName;
                })
            );

            setQueryNames(names);
        } catch (error) {
            console.error('Error in fetchQueryNames:', error);
        }
    };

    function rewriteText(text) {
        text = text.trim().replace(/\s{2,}/g, ' ');

        text = text.replace(/(\b[A-Za-z])(?=[^\w\s])/g, '$1 ').replace(/  +/g, ' ');

        text = text.replace(/(\d+)\.\s+/g, (match, number) => `<br/>${number}. `);

        text = text.replace(/\*([^*]+)\*/g, '<i>$1</i>');

        text = text.replace(/'([^']+)'/g, '<b>$1</b>');

        return text;
    }

    useEffect(() => {
        fetchQueryNames();
    }, [firstIds]);

    return (
        <div className="App">
            <div className="sideBar">
                <div className="upperSide">
                    <div className="upperSideTop">
                    </div>
                    <button
                        className="midBtn"
                        onClick={handleNewChat}
                        disabled={isConversationEmpty}
                    >
                        <img src={imageLogo} alt="new chat" className="addBtn"/>
                        New Chat
                    </button>
                    <div className="upperSideBottom">
                        {firstIds ? (
                            <div className="upperSideBottom">
                                {firstIds.slice().reverse().map((id, index) => (
                                    <div key={id} className="query" onClick={() => handleQueryClick(id)}>
                                        <img src={msgIcon} alt="listItemsImg" />
                                        {`${queryNames[index]}`}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>Loading or handling null case...</div>
                        )}
                    </div>
                </div>
                <div className="lowerSide">
                    <div className="listItems"><img src={home} alt="home" className="listItemsImg"/>Home</div>
                    <div className="listItems"><img src={saved} alt="saved" className="listItemsImg"/>Model</div>
                    <Link
                        to="/settings"
                        className="listItems"
                        style={{ textDecoration: 'none', color: 'white' }}
                    >
                        <img src={rocket} alt="rocket" className="listItemsImg" />
                        Settings
                    </Link>
                </div>
            </div>
            <div className="main">
                <div className="chats">
                    {firstIds && (
                        <div className="chat bot">
                            <img className="chatImg" src={imageLogo} alt=""/>
                            <p className="txt">
                                Hello, I'm WordCrafted, a state-of-the-art language model developed by a student team at KTH. I'm designed to understand and generate human-like text based on the input I receive. You can ask me questions and have conversations. Just let me know how I can assist you!
                            </p>
                        </div>
                    )}
                    {selectedConversation && selectedConversation.messages.map((message) => (
                        <div key={message.id} className={message.senderId === 0 ? 'chat bot' : 'chat'}>
                            <img
                                className="chatImg"
                                src={message.senderId === 0 ? imageLogo : userIcon}
                                alt=""
                            />
                            <p className="txt" dangerouslySetInnerHTML={{ __html: rewriteText(message.content) }}></p>
                        </div>
                    ))}
                </div>
                <div className="chatFooter">
                    <div className="inp">
                        <input type="text" placeholder='Send Message' value={input} onChange={(e) => setInput(e.target.value)}/>
                        <button className="send" onClick={handleSend} disabled={isSending}>
                            {isSending ? (
                                <i className="fa-solid fa-sync fa-spin"></i>
                            ) : (<img src={sendBtn} alt="sendBtn"/>
                            )}
                        </button>
                    </div>
                    <p>WordCrafted can produce inaccurate information about data, claims, or facts. WordCrafted February 06 Version.</p>
                </div>
            </div>

        </div>
    );
}

export default Home;
