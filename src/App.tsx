import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreateGiveaway from './pages/CreateGiveaway';
import GiveawayList from './pages/GiveawayList';
import GiveawayPage from './pages/GiveawayPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateGiveaway />} />
          <Route path="/giveaways" element={<GiveawayList />} />
          <Route path="/g/:id" element={<GiveawayPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;