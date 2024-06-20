import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PagesStyle/EmbeddingsStyle.css';

const Embeddings = () => {
    const [neo4jUri] = useState('bolt://localhost:7687'); // Hardcoded URI for Neo4j
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [connected, setConnected] = useState(false);
    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [newDatabaseName, setNewDatabaseName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [neo4jQuery, setNeo4jQuery] = useState('');
    const [queryResult, setQueryResult] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        listDatabases();
    }, []); // Fetch databases on initial load

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConnect = () => {
        //axios.post('http://localhost:9090/neo4j/connect', null, {
        axios.post('https://proxyembedding.vm-app.cloud.cbh.kth.se/neo4j/connect', null, {
            params: {
                uri: neo4jUri,
                user: username,
                password: password
            }
        })
            .then(response => {
                if (response.data) {
                    setConnected(true);
                    listDatabases();
                }
            })
            .catch(error => {
                setError('Failed to connect to Neo4j instance');
                console.error('Error connecting to Neo4j:', error);
            });
    };

    const listDatabases = () => {
        //axios.get('http://localhost:9090/neo4j/listDatabases')
        axios.get('https://proxyembedding.vm-app.cloud.cbh.kth.se/neo4j/listDatabases')
            .then(response => {
                setDatabases(response.data);
                if (response.data.length > 0) {
                    setSelectedDatabase(response.data[0]); // Set the first database as default
                }
            })
            .catch(error => {
                setError('Failed to list databases');
                console.error('Error listing databases:', error);
            });
    };

    const handleNeo4jQueryChange = (event) => {
        setNeo4jQuery(event.target.value);
        setError(null); // Clear any previous errors when input changes
    };

    const handleSendQuery = () => {
        const query = neo4jQuery.trim();
        if (query) {
            //axios.post('http://localhost:9090/neo4j/query', { query })
            axios.post('https://proxyembedding.vm-app.cloud.cbh.kth.se/neo4j/query', { query })
                .then(response => {
                    setQueryResult(response.data);
                })
                .catch(error => {
                    setError('Error executing query');
                    console.error('Error executing query:', error);
                });
        } else {
            setError('Please enter a valid Neo4j query');
        }
    };

    const handleDatabaseChange = (event) => {
        setSelectedDatabase(event.target.value);
    };

    const handleCreateDatabase = () => {
        if (!newDatabaseName || !newUsername || !newPassword) {
            setError('Please enter database name, username, and password');
            return;
        }

        //axios.post('http://localhost:9090/neo4j/createDatabase', null, {
        axios.post('https://proxyembedding.vm-app.cloud.cbh.kth.se/neo4j/createDatabase', null, {
            params: {
                databaseName: newDatabaseName,
                user: newUsername,
                password: newPassword
            }
        })
            .then(response => {
                setError(null);
                setNewDatabaseName('');
                setNewUsername('');
                setNewPassword('');
                listDatabases(); // Refresh the list of databases after creation
            })
            .catch(error => {
                setError('Failed to create database');
                console.error('Error creating database:', error);
            });
    };

    return (
        <div className="embeddings-container">
            <div className="embeddings-box">

                {!connected && (
                    <div className="connection-box">
                        <h2>Connect to Neo4j</h2>
                        <label htmlFor="usernameInput">Username:</label>
                        <input
                            type="text"
                            id="usernameInput"
                            value={username}
                            onChange={handleUsernameChange}
                            className="neo4j-input"
                        />
                        <label htmlFor="passwordInput">Password:</label>
                        <input
                            type="password"
                            id="passwordInput"
                            value={password}
                            onChange={handlePasswordChange}
                            className="neo4j-input"
                        />
                        <button className="connect-btn" onClick={handleConnect}>
                            Connect
                        </button>
                        <Link to="/" className="back-btn-link">
                            <button className="back-btn-start">Back</button>
                        </Link>
                    </div>
                )}

                {connected && (
                    <div className="query-box">
                        {databases.length > 0 && (
                            <div className="databases-list">
                                <h2>Databases:</h2>
                                <div className="database-options">
                                    {databases.map((db, index) => (
                                        <label key={index} className="database-option">
                                            <input
                                                type="radio"
                                                value={db}
                                                checked={selectedDatabase === db}
                                                onChange={handleDatabaseChange}
                                            />
                                            {db}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="create-database-box">
                            <h2>Create New Database:</h2>
                            <label htmlFor="newDatabaseNameInput">Database Name:</label>
                            <input
                                type="text"
                                id="newDatabaseNameInput"
                                value={newDatabaseName}
                                onChange={(e) => setNewDatabaseName(e.target.value)}
                                className="neo4j-input"
                            />
                            <label htmlFor="newUsernameInput">Username:</label>
                            <input
                                type="text"
                                id="newUsernameInput"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="neo4j-input"
                            />
                            <label htmlFor="newPasswordInput">Password:</label>
                            <input
                                type="password"
                                id="newPasswordInput"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="neo4j-input"
                            />
                            <button className="connect-btn" onClick={handleCreateDatabase}>
                                Create Database
                            </button>
                        </div>

                        <label htmlFor="neo4jQueryInput">Enter Neo4j Query:</label>
                        <textarea
                            id="neo4jQueryInput"
                            value={neo4jQuery}
                            onChange={handleNeo4jQueryChange}
                            placeholder="Enter your Neo4j query here..."
                            className="neo4j-query-input"
                            disabled={!connected} // Disable textarea when not connected
                            style={{ resize: 'none' }} // Make textarea non-resizable
                        />

                        {error && <p className="error-message">{error}</p>}

                        <div className="button-group">
                            <button className="send-query-btn" onClick={handleSendQuery}>
                                Send
                            </button>
                            <Link to="/" className="back-btn-link">
                                <button className="back-btn">Back</button>
                            </Link>
                        </div>

                        {queryResult && (
                            <div className="query-result">
                                <h3>Query Result:</h3>
                                <pre>{queryResult}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Embeddings;
