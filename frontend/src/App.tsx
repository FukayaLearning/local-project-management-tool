import { Routes, Route, Link } from 'react-router-dom';
import { Group, Button, Container } from '@mantine/core';
import './App.css';
import { SettingsPage } from './Settings';

function App() {
  return (
    <>
      <Group p="md" justify="center">
          <Link to="/">
              <Button variant="outline">Home</Button>
          </Link>
          <Link to="/settings">
              <Button variant="outline">Settings</Button>
          </Link>
      </Group>

      <Container>
        <Routes>
          <Route path="/" element={
            <div className="card">
               <h1>Project Management Tool</h1>
               <p>Welcome to the local project management tool.</p>
            </div>
          } />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
