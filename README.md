# SweBot React Node Project

## Overview

This repository contains a React Node application implementing a medical chatbot. Users can interact with the chatbot to ask medical-related questions and receive responses. The project is organized into three main components: `Home.js`, `Settings.js`, and `App.js`. Additionally, there is an `api.js` file containing functions related to API communication.

## Components

### 1. Home.js

#### Purpose

`Home.js` is the main component responsible for rendering the chat interface and handling user interactions.

#### Key Features

- Initializes the application, fetches or starts conversations based on the user's UUID.
- Handles sending and receiving messages to and from the backend.
- Supports the creation of new conversations and displays a list of recent conversations.

#### Dependencies

- React
- react-router-dom
- Axios

### 2. Settings.js

#### Purpose

`Settings.js` provides a settings interface where users can view and update their UUID.

#### Key Features

- Displays the current UUID.
- Allows users to input a new UUID for their session.
- Validates and updates the UUID, redirecting to the home page on success.

#### Dependencies

- React
- react-router-dom

### 3. App.js

#### Purpose

`App.js` sets up the application routes using React Router, rendering the `Home` and `Settings` components.

#### Dependencies

- React
- react-router-dom

## API Communication

### 1. api.js

#### Purpose

`api.js` contains functions for interacting with the backend API.

#### Functions

- `initializeUUID`: Initializes the UUID by either retrieving it from local storage or generating a new one.
- `sendMsgToBackend`: Sends a user or bot message to the backend.
- `sendMsgToBotBackend`: Sends a user message to a separate backend for bot responses.
- `initializeProgram`: Fetches existing conversation IDs for a given UUID.
- `fetchConversationById`: Fetches a conversation by its ID.
- `startNewConversation`: Initiates a new conversation for a given owner ID.

#### Dependencies

- Axios

## Usage

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Open your browser and navigate to `http://localhost:3000`

## Important Note

- The medical chatbot may produce inaccurate information about treatments, symptoms, or facts.
- This application was last updated on January 19th, Version.

Feel free to explore the code, and if you have any questions or concerns, please reach out to the project maintainers.

Enjoy using the SweBot!
