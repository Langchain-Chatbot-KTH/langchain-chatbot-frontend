/**
 * Settings component for managing user settings.
 * @component
 */

import React, { useState, useEffect } from 'react';
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
    const storedModel = localStorage.getItem('model') || 'llama3';
    const [selectedModel, setSelectedModel] = useState(storedModel);

    const models = {
        'llama3': ['8b', '70b'],
        'phi3': ['3.8b', '14b'],
        'mistral': ['7b']
    };

    useEffect(() => {
        localStorage.setItem('model', selectedModel);
    }, [selectedModel]);

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

    /**
     * Handles model selection change.
     * @param {string} model - The selected model
     * @param {string} size - The selected model size
     */
    const handleModelChange = (model, size) => {
        if (size === models[model][0]) {
            setSelectedModel(model);
        } else {
            setSelectedModel(`${model}:${size}`);
        }
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
            <div className="models-box">
                <label htmlFor="uuidInput">Select Model</label>
                {Object.keys(models).map((model) => (
                    <div key={model} className="model-group">
                        <p className="model-name">{model.charAt(0).toUpperCase() + model.slice(1)}</p>
                        <div className="size-options">
                            {models[model].map((size) => (
                                <label key={size} className="model-label">
                                    <input
                                        type="radio"
                                        name="model"
                                        checked={
                                            (selectedModel === model && size === models[model][0]) ||
                                            selectedModel === `${model}:${size}`
                                        }
                                        onChange={() => handleModelChange(model, size)}
                                    />
                                    {size}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
