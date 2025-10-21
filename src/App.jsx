import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import PageNumberBox from './components/PageNumberBox.jsx';
import StateSelect from './components/StateSelect.jsx';
import Tabs from './components/Tabs.jsx';
import ContentPicks from './components/ContentPicks.jsx';

import ContentPanels from './components/ContentPanels.jsx';
import ContentDraws from './components/ContentDraws.jsx';
import ContentScoreboard from './components/ContentScoreboard.jsx';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
const queryClient = new QueryClient();
const DEFAULT_TABS = ['1. Scoreboard', '2. Picks', '3. Panels', '4. Draws']
const DEFAULT_STATE = "";

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [dataAvailable, setDataAvailable] = useState(false);
  const handleStateChange = (value) => { setState(value); localStorage.setItem('state', value); console.log('State changed', value); };
  const handleDataLoaded = () => { 
    setDataAvailable(true); 
    console.log('Data Loaded', state); 
    const storedPage = localStorage.getItem('page-number');
    if (storedPage) { setPage(storedPage); }
  };
  const handleDataUpdated = () => { queryClient.invalidateQueries({ queryKey: [state] }); console.log('Data Updated', state); };
  
  const [num, setNum] = useState(0);
  const [page, setPage] = useState("Loading ...");
  useEffect(() => {
    const storedState = localStorage.getItem('state');
    if (storedState) { if(storedState=='ok') setState(storedState); }
    const storedValue = localStorage.getItem('magic-number');
    if (storedValue) { setNum(storedValue); }
    const storedTab = localStorage.getItem('tab');
    if (storedTab) { setTab(storedTab); }
    return () => {};
  }, []);
  const handleNumChange = (value) => { setNum(value); console.log('Num changed', value); };
  const handleNumClick = (value) => { setNum(value); setTab('Tablet'); localStorage.setItem('tab', 'Tablet'); console.log('Num clicked', value); };
  const handlePageChange = (value) => { setPage(value); localStorage.setItem('page-number', value); console.log('Page changed', value); };

  const [tab, setTab] = useState(DEFAULT_TABS[0]);
  const handleTabChange = (value) => { setTab(value); localStorage.setItem('tab', value); setPage(value); localStorage.setItem('page-number', value); console.log('Tab changed', value); };

  return (
    <>
      <Header />
      <QueryClientProvider client={queryClient}>
        <PageNumberBox page={page} />
        <StateSelect selectedState={state} onStateChange={handleStateChange} onDataLoaded={handleDataLoaded} onDataUpdated={handleDataUpdated} />
        {dataAvailable &&
          <main className="flex flex-col items-center">
            <Tabs onTabChange={handleTabChange} selectedTab={tab} tabList={DEFAULT_TABS} />
            { tab===DEFAULT_TABS[0] && <ContentScoreboard onPageChange={handlePageChange} state={state} /> }
            { tab===DEFAULT_TABS[1] && <ContentPicks onPageChange={handlePageChange} state={state} /> }
            { tab===DEFAULT_TABS[2] && <ContentPanels onPageChange={handlePageChange} state={state} /> }
            { tab===DEFAULT_TABS[3] && <ContentDraws onPageChange={handlePageChange} state={state} /> }
          </main>
        }
      </QueryClientProvider>
    </>
  );
}
