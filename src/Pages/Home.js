import React, { useEffect, useState } from 'react';
import './PagesStyle/HomeStyle.css';
import msgIcon from '../assets/message.svg';
import home from '../assets/home.svg';
import saved from '../assets/bookmark.svg';
import rocket from '../assets/rocket.svg';
import sendBtn from '../assets/send.svg';
import userIcon from '../assets/TansparentPerson.png';
import imageLogo from '../assets/IconChatBot.png';
import {
    sendMsgToBackend,
    initializeProgram,
    fetchConversationById,
    startNewConversation,
    sendMsgToBotBackend
} from '../chatApi';
import { initializeUUID } from "./UUID";
import { Link } from "react-router-dom";

function Home() {
    const [input, setInput] = useState('');
    const [firstIds, setFirstIds] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isConversationEmpty, setIsConversationEmpty] = useState(true);
    const [uuid, setuuid] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const uuid = await initializeUUID();
                setuuid(uuid);

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

        // Function to initialize SSE
        const initializeSSE = () => {
            const sse = new EventSource(`http://localhost:9090/subscribe/b06c92b2-8fcc-41b0-90fe-a9a60051f545`);

            sse.onmessage = (event) => {
                console.log("The received message: " + event.data);
                const data = event.data;
                setData(data);
            };

            sse.onerror = () => {
                // Error handling
                console.error('SSE failed');
                sse.close();
            };

            // Clean up the SSE connection when the component unmounts
            return () => {
                sse.close();
            };
        };

        initialize();

        // Call the function to initialize SSE
        const cleanup = initializeSSE();

        // Return the cleanup function from useEffect
        return cleanup;
    }, []);

    useEffect(() => {
        // This effect acts whenever 'data' changes and is not null.
        if (data) {
            console.log("Data received from SSE: ", data);
            sendMsgToBackend(data, selectedConversation.id, 0);
            handleQueryClick(selectedConversation.id);
        }
    }, [data]); // This effect depends on 'data'

    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const text = input;

        if (selectedConversation) {
            try {
                setIsSending(true);
                await sendMsgToBackend(text, selectedConversation.id, 1);
                await sendMsgToBotBackend(text, uuid);
                setInput('');
                await handleQueryClick(selectedConversation.id);

                if (selectedConversation.messages.length <= 1) {
                    await fetchQueryNames();
                }
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setIsSending(false);
            }
        } else {
            console.error('No conversation selected to send a message to.');
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
            setuuid(uuid);
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

    useEffect(() => {
        fetchQueryNames();
    }, [firstIds]);

    const processText = (text) => {
        text = text.replace(/(\d+)\.\s*/g, "$1. ");
        text = text.replace(/\*/g, "\n• ");
        text = text.replace(/\n/g, "<br>");
        return text;
    };

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
                            <p className="txt" dangerouslySetInnerHTML={{ __html: message.senderId === 0 ? processText(message.content) : message.content }}></p>
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
