import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SiteDataSeed, type SiteData } from './context/SiteDataContext';
import App from './App.tsx';
import './index.css';

// Prerendered pages carry their markup and the content it was rendered from; the app
// takes over that markup instead of fetching and drawing the page again.
const root = document.getElementById('root')!;
const seedJson = document.getElementById('site-data')?.textContent;
const seed: SiteData | null = seedJson ? JSON.parse(seedJson) : null;

const app = (
  <StrictMode>
    <BrowserRouter>
      <SiteDataSeed.Provider value={seed}>
        <App />
      </SiteDataSeed.Provider>
    </BrowserRouter>
  </StrictMode>
);

if (seed && root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
