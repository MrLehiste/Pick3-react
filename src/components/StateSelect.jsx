import { useState, useEffect } from 'react';
import './StateSelect.css';
import SvgMid from './SvgMid.jsx';
import SvgEve from './SvgEve.jsx';

export default function StateSelect({onStateChange}) {
    const [selectedState, setSelectedState] = useState('fl');
    const handleStateChange = (event) => {
      setSelectedState(event.target.value);
      onStateChange(event.target.value);
    };
    const [updatingDraws, setUpdatingDraws] = useState(false);
    const handleUpdateDraws = () => {
      setUpdatingDraws(true);
      const updateDrawsUrl = 'https://pick3-function-api.azurewebsites.net/api/UpdateDraws?code=bp3LiIDPjOy9E4u4Ti5cL/EJW0CspBb1OljrnkNBuVuaa4CQNMmSJw==';
      fetch(updateDrawsUrl)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setUpdatingDraws(false); // Set loading back to false once request is complete
        })
        .catch(error => {
          // Handle errors
          console.error('Error fetching data:', error);
          setUpdatingDraws(false); // Set loading back to false on error
        });
    };
    const EMPTY_DRAW = [
      {
          "Date": "1001-01-01T00:00:00",
          "Me": "M",
          "Num": "***",
          "Fb": " ",
          "St": ""
      },
      {
          "Date": "1001-01-01T00:00:00",
          "Me": "E",
          "Num": "***",
          "Fb": " ",
          "St": ""
      }
  ]
    const [lastDraws, setLastDraws] = useState(EMPTY_DRAW);
    const [retryCount, setRetryCount] = useState(0);
    useEffect(() => {
      const lastDrawsUrl = 'https://pick3-function-api.azurewebsites.net/api/Function1?code=QkFG8WBGJqanfaa0mB6hVpn/03XoLd5Klbqq4X5deWJaNUgHulGHiA=='
        + '&state=' + selectedState;
      fetch(lastDrawsUrl)
        .then(response => {
          if (!response.ok) { throw new Error('Network response was not ok.'); }
          return response.json();
        })
        .then(data => { 
          //console.log(data); 
          setLastDraws(data); 
        })
        .catch(error => {
          console.error('There was a problem fetching the data:', error);
          if(retryCount <= 2) {
            setTimeout(() => {
              setRetryCount(retryCount + 1);
            }, 2000);
          }
          else { window.location.reload(); }
        });
    }, [selectedState, updatingDraws, retryCount]); 

    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const displayDraws = lastDraws.map((item, index) => (
      <div className="mb-1" key={index}>
          <span className="text-stone-800 font-semibold">
          { item['Me']==='M' && <SvgMid /> }
          { item['Me']==='E' && <SvgEve /> } 
          {new Date(item['Date']).toLocaleDateString('en-US', dateOptions)} </span>
          <ul className="ml-2 game-numbers game-numbers--pick3" aria-label="Pick 3 Winning Numbers">
              <li className="game-numbers__number"><span>{item['Num'][0]}</span></li>
              <li className="game-numbers__number"><span>{item['Num'][1]}</span></li>
              <li className="game-numbers__number"><span>{item['Num'][2]}</span></li>
          </ul>
        </div>
    ));

    return (
      <div className="flex flex-col items-center mb-2">
        <div>
          <select className="px-2 py-1 mb-2 mr-2" value={selectedState} onChange={handleStateChange}>
              <option value="ca">California</option>
              <option value="fl">Florida</option>
          </select>
          <button onClick={handleUpdateDraws} disabled={updatingDraws} className="px-2 py-1 font-semibold uppercase rounded text-stone-900 bg-amber-100 hover:bg-amber-500">
            { updatingDraws ? 'Updating ...' : 'Update Draws' }
          </button>
        </div>
        {displayDraws}
      </div>
    );
  }
  