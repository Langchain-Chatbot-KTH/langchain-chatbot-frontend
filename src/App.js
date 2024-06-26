import React from 'react';
import Home from './Pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from "./Pages/Components/Footer";
import Settings from "./Pages/Settings";
import Embeddings from "./Pages/Embeddings";

function App() {
  return (
      <>
          <Router>
              <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/settings' element={<Settings />} />
                  <Route path='/embedding' element={<Embeddings />} />
              </Routes>
              <Footer />
          </Router>
      </>
  );
}
export default App;