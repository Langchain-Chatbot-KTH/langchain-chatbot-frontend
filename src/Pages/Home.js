/**
 * Home component for the chat application.
 * @component
 */
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
    sendMsgToBotBackendStream,
    sendMsgToBotBackendStreamFile,
    sendMsgToBotBackendStreamImage, sendMsgToBotBackendStreamUrl
} from './PagesLogic/chatApi';
import { initializeUUID } from "./PagesLogic/UUID";
import { Link } from "react-router-dom";
import { parseText } from "./PagesLogic/textParser";

/**
 * Home component responsible for handling chat functionalities.
 * @returns {JSX.Element} Home component JSX
 */
function Home() {
    const [input, setInput] = useState('');
    const [transparentBoxVisible, setTransparentBoxVisible] = useState(false);
    const [boxType, setBoxType] = useState('file');
    const [firstIds, setFirstIds] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isConversationEmpty, setIsConversationEmpty] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [queryNames, setQueryNames] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedUrl, setSelectedUrl] = useState('');
    const [tokenString, setTokenString] = useState('');
    const [urlError, setUrlError] = useState('');


    const handleTransparentBoxToggle = () => {
        setTransparentBoxVisible(!transparentBoxVisible);
    };

    const handleBoxTypeChange = (type) => {
        setBoxType(type);
    };

    const handleSend = async () => {
        let text = input;
        setTokenString("");
        if (selectedConversation) {
            const connection = await handleInitSse();
            try {
                setIsSending(true);

                if(selectedFile !== null || selectedImage !== null || selectedUrl !== ''){
                    switch (boxType) {
                        case 'file':
                            sendMsgToBotBackendStreamFile(selectedFile, text, selectedConversation.id);
                            handleStream(connection);
                            text += "\n";
                            text += selectedFile.name;
                            break;
                        case 'image':
                            sendMsgToBotBackendStreamImage(selectedImage, text, selectedConversation.id);
                            handleStream(connection);
                            break;
                        case 'url':
                            if (!isValidURL(selectedUrl)) {
                                setUrlError('The URL is in the wrong format. Please enter a valid URL.');
                                setIsSending(false);
                                setTimeout(() => {
                                    setUrlError('');
                                }, 5000);
                                setSelectedUrl('');
                                return;
                            }
                            text += "\n";
                            text += selectedUrl;
                            sendMsgToBotBackendStreamUrl(selectedUrl, text, selectedConversation.id);
                            handleStream(connection);
                            break;
                    }

                    await sendMsgToBackend(text, selectedConversation.id, 1);
                    setInput('');
                    await handleQueryClick(selectedConversation.id);

                    if (selectedConversation.messages.length <= 1) {
                        await fetchQueryNames();
                    }

                    setSelectedFile(null);
                    setSelectedImage(null);
                    setSelectedUrl('');
                    setBoxType('file');
                } else {
                    await sendMsgToBackend(text, selectedConversation.id, 1);
                    setInput('');
                    await handleQueryClick(selectedConversation.id);

                    if (selectedConversation.messages.length <= 1) {
                        await fetchQueryNames();
                    }
                    sendMsgToBotBackendStream(text, selectedConversation.id);
                    handleStream(connection);
                }

                setTransparentBoxVisible(false);
                setInput('');
                setTokenString('');

            } catch (error) {
                setIsSending(false);
                console.error('Error sending message:', error);
            }
        } else {
            console.error('No conversation selected to send a message to.');
        }
    };

    function isValidURL(string) {
        var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(string);
    }

    const handleInitSse = async () => {
        const uuid = localStorage.getItem('uuid');
        return new EventSource(`http://localhost:9090/subscribe/${uuid}`);
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleImageSelect = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleUrlInput = (event) => {
        setSelectedUrl(event.target.value);
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
            setTokenString("");
            const uuid = await initializeUUID();
            const newConversationId = await startNewConversation(uuid);
            setFirstIds((prevIds) => [...prevIds, newConversationId]);
            await handleQueryClick(newConversationId);
        } catch (error) {
            console.error('Error starting new chat:', error);
        }
    };

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

    useEffect(() => {
        fetchQueryNames();
    }, [firstIds]);

    const handleStream = async (source) => {
        let tokenSum = "";

        source.onmessage = async (event) => {
            let tokens = event.data.match(/"([^"]*)"|[^"\s]+/g);
            if (tokens) {
                tokens = tokens.map(token => token.replace(/^"|"$/g, ''));
                for (const token of tokens) {
                    if (token === "#FC9123CFAA1953123#") {
                        await sendMsgToBackend(tokenSum, selectedConversation.id, 0);
                        setIsSending(false);
                        source.close();
                    } else {
                        tokenSum += token;
                        setTokenString(prevTokenString => prevTokenString + token);
                    }
                }
            }
        }

        source.onerror = (error) => {
            console.error('SSE Error:', error);
        };
    }

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
                    <div className="listItems" onClick={handleTransparentBoxToggle}><img src={saved} alt="saved" className="listItemsImg"/>File</div>
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
                            <p className="txt" dangerouslySetInnerHTML={{ __html: parseText(message.content) }}></p>
                        </div>
                    ))}
                    {tokenString && (
                        <div className='chat bot'>
                            <img className="chatImg" src={imageLogo} alt=""/>
                            <p className="txt" dangerouslySetInnerHTML={{ __html: parseText(tokenString) }}></p>
                        </div>
                    )}
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
            {transparentBoxVisible && (
                <div className="transparentBox">
                    <div className="optionBox">
                        <select value={boxType} onChange={(e) => handleBoxTypeChange(e.target.value)}>
                            <option value="file">File</option>
                            <option value="image">Image</option>
                            <option value="url">URL</option>
                        </select>
                    </div>
                    {boxType === 'file' && (
                        <div className="inputBox">
                            <input type="file" accept=".txt,.pdf" onChange={handleFileSelect} />
                        </div>
                    )}
                    {boxType === 'image' && (
                        <div className="inputBox">
                            <input type="file" accept="image/*" onChange={handleImageSelect} />
                        </div>
                    )}
                    {urlError && <p className="error">{urlError}</p>}
                    {boxType === 'url' && (
                        <div className="inputBox">
                            <input type="text" placeholder="Enter URL" value={selectedUrl} onChange={handleUrlInput} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Home;
