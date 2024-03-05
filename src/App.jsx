import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MagicNumberBox from './components/MagicNumberBox.jsx';
import StateSelect from './components/StateSelect.jsx';
import Tabs from './components/Tabs.jsx';
import ContentMagic from './components/ContentMagic.jsx';
import ContentTablet from './components/ContentTablet.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import ContentScramble from './components/ContentScramble.jsx';
import ContentPicks from './components/ContentPicks.jsx';

export default function App() {
  const [state, setState] = useState('fl');
  const handleStateChange = (value) => { setState(value); console.log('State changed', value); };
  const [num, setNum] = useState(0);
  const handleNumChange = (value) => { setNum(value); console.log('Num changed', value); };
  const [tab, setTab] = useState('Magic');
  const handleTabChange = (value) => { setTab(value); console.log('Tab changed', value); };

  return (
    <>
      <Header />
      <StateSelect onStateChange={handleStateChange} />
      <main className="flex flex-col items-center">
        <MagicNumberBox onNumberChange={handleNumChange} />
        <Tabs onTabChange={handleTabChange} />
        { tab==='Magic' && <ContentMagic state={state} num={num} /> }
        { tab==='Tablet' && <ContentTablet state={state} num={num} /> }
        { tab==='Panels' && <ContentPanel state={state} num={num} /> }
        { tab==='Scramble' && <ContentScramble state={state} num={num} /> }
        { tab==='Picks' && <ContentPicks state={state} num={num} /> }
      </main>
    </>
  );
}
