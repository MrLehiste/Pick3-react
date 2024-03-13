import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import MagicNumberBox from './components/MagicNumberBox.jsx';
import StateSelect from './components/StateSelect.jsx';
import Tabs from './components/Tabs.jsx';
import ContentMagic from './components/ContentMagic.jsx';
import ContentTablet from './components/ContentTablet.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import ContentScramble from './components/ContentScramble.jsx';
import ContentPicks from './components/ContentPicks.jsx';
import ContentX from './components/ContentX.jsx';

export default function App() {
  const [state, setState] = useState('fl');
  const handleStateChange = (value) => { setState(value); setTab('X'); console.log('State changed', value); };
  const [num, setNum] = useState(0);
  useEffect(() => {
    const storedValue = localStorage.getItem('magic-number');
    if (storedValue) { setNum(storedValue); }
    return () => {};
  }, []);
  const handleNumChange = (value) => { setNum(value); console.log('Num changed', value); };
  const handleNumClick = (value) => { setNum(value); setTab('Tablet'); console.log('Num clicked', value); };
  const [tab, setTab] = useState();
  const handleTabChange = (value) => { setTab(value); console.log('Tab changed', value); };

  return (
    <>
      <Header />
      <StateSelect onStateChange={handleStateChange} />
      <main className="flex flex-col items-center">
        <MagicNumberBox onNumberChange={handleNumChange} num={num} />
        <Tabs onTabChange={handleTabChange} selectedTab={tab} />
        { tab==='X' && <ContentX state={state} num={num} /> }
        { tab==='Magic' && <ContentMagic onNumberClick={handleNumClick} state={state} num={num} /> }
        { tab==='Tablet' && <ContentTablet state={state} num={num} /> }
        { tab==='Panel' && <ContentPanel state={state} num={num} /> }
        { tab==='Scramble' && <ContentScramble state={state} num={num} /> }
        { tab==='Picks' && <ContentPicks state={state} num={num} /> }
      </main>
    </>
  );
}
