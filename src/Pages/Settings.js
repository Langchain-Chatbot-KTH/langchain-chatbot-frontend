/**
 * Settings component for managing user settings.
 * @component
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PagesStyle/Settings.css';

/**
 * Settings component.
 * @returns {JSX.Element} Settings component JSX
 */
const Settings = () => {
    const [inputUUID, setInputUUID] = useState('');
    const [error, setError] = useState('');
    const storedUUID = localStorage.getItem('uuid');

    /**
     * Handles UUID change event.
     */
    const handleUUIDChange = () => {
        if (isValidUUID(inputUUID)) {
            localStorage.setItem('uuid', inputUUID);
            setError('');
            // Redirect to the home page after successfully updating the UUID
            window.location.href = '/';
        } else {
            setError('Invalid UUID format. Please enter a valid UUID.');
        }
    };

    /**
     * Validates UUID format.
     * @param {string} uuid - The UUID to validate
     * @returns {boolean} True if UUID is valid, false otherwise
     */
    const isValidUUID = (uuid) => {
        const uuidRegex = /^[a-f\d]{8}-[a-f\d]{4}-[1-5][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
        return uuidRegex.test(uuid);
    };

    return (
        <div className="settings-container">
            <div className="settings-box">
                <h1>Settings</h1>
                <p className="uuid-display">UUID: {storedUUID}</p>

                <label htmlFor="uuidInput">Enter your own UUID:</label>
                <input
                    type="text"
                    id="uuidInput"
                    value={inputUUID}
                    onChange={(e) => setInputUUID(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />

                {error && <p className="error-msg">{error}</p>}

                <button className="update-uuid-btn" onClick={handleUUIDChange}>
                    Update UUID
                </button>

                <Link to="/">
                    <button className="close-btn">Close</button>
                </Link>
            </div>
        </div>
    );
};

export default Settings;
