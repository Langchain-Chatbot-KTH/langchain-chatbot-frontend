// Home.js

import React, { useEffect, useState } from 'react';
import './PagesStyle/HomeStyle.css';
import addBtn from '../assets/add-30.png';
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
                }

            } catch (error) {
                console.error('Error initializing UUID:', error);
            }
        };

        initialize();
    }, []);

    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const text = input;

        if (selectedConversation) {
            try {
                setIsSending(true);
                await sendMsgToBackend(text, selectedConversation.id, 1);
                const botResponse = await sendMsgToBotBackend(text, selectedConversation.id);
                await sendMsgToBackend(botResponse.toString(), selectedConversation.id, 0);
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


    return (
        <div className="App">
            <div className="sideBar">
                <div className="upperSide">
                    <div className="upperSideTop">
                        <i className="fa-regular fa-comments fa-xl fa-beat"></i>
                        <span className="brand">SW3BOT</span>
                    </div>
                    <button
                        className="midBtn"
                        onClick={handleNewChat}
                        disabled={isConversationEmpty}
                    >
                        <img src={addBtn} alt="new chat" className="addBtn"/>
                        Ny Chatt!
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
                    <div className="listItems"><img src={home} alt="home" className="listItemsImg"/>Hem</div>
                    <div className="listItems"><img src={saved} alt="saved" className="listItemsImg"/>Sparade</div>
                    <Link
                        to="/settings"
                        className="listItems"
                        style={{ textDecoration: 'none', color: 'white' }}
                    >
                        <img src={rocket} alt="rocket" className="listItemsImg" />
                        Inställningar
                    </Link>
                </div>
            </div>
            <div className="main">
                <div className="chats">
                    {firstIds && (
                        <div className="chat bot">
                            <img className="chatImg" src={imageLogo} alt=""/>
                            <p className="txt">
                                Hej, jag är SW3Bot, en toppmodern språkmodell utvecklad av ett studentteam vid KTH.
                                Jag är utformad för att förstå och generera mänskligt liknande text baserat på den input jag får.
                                Du kan ställa mig frågor och ha konversationer. Berätta bara hur jag kan hjälpa dig!
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
                            <p className="txt">{message.content}</p>
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
                    <p>SW3Bot kan producera felaktig information om data, påståenden eller fakta. SW3Bot Januari 29 Version.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
