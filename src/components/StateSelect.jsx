import { useState, useEffect } from 'react';
import './StateSelect.css';
import SvgMid from './SvgMid.jsx';
import SvgEve from './SvgEve.jsx';
import LoadingIndicator from './UI/LoadingIndicator.jsx';

const STATES = [
  {st: "", state: "-- Select State --", game: ""},
  {st: "ar", state: "Arkansas", game: "Cash 3"},
  {st: "fl", state: "Florida", game: "Pick 3"},
  {st: "mo", state: "Missouri", game: "Pick 3"},
];

export default function StateSelect({ selectedState, onStateChange, onDataLoaded, onDataUpdated }) {
    //const [selectedState, setSelectedState] = useState('fl');
    const handleStateChange = (event) => {
      //setSelectedState(event.target.value);
      onStateChange(event.target.value);
      setDataLoaded(false);
    };
    const [updatingDraws, setUpdatingDraws] = useState(false);
    const handleUpdateDraws = () => {
      setUpdatingDraws(true);
      const updateDrawsUrl = import.meta.env.VITE_URL_UPDATE + '&state=' + selectedState;
      fetch(updateDrawsUrl)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setUpdatingDraws(false); // Set loading back to false once request is complete
          onDataUpdated();
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
    const [dataLoaded, setDataLoaded] = useState(false);
    const [lastDraws, setLastDraws] = useState(EMPTY_DRAW);
    const [retryCount, setRetryCount] = useState(0);
    useEffect(() => {
      if(selectedState=="") return;
      const lastDrawsUrl = import.meta.env.VITE_URL_LAST_2 + '&state=' + selectedState;
      console.log('Loading...', lastDrawsUrl);
      fetch(lastDrawsUrl)
        .then(response => {
          if (!response.ok) { throw new Error('Network response was not ok.'); }
          return response.json();
        })
        .then(data => { 
          //console.log(data); 
          setLastDraws(data); 
          setDataLoaded(true);
          onDataLoaded();
          console.log(data[0].Date, dateAge(data[0].Date));
          if(dateAge(data[0].Date) > (selectedState=="fl" ? 2 : 2)) handleUpdateDraws();
        })
        .catch(error => {
          console.error('There was a problem fetching the data:', error);
          if(retryCount <= 3) {
            setTimeout(() => {
              setRetryCount(retryCount + 1);
            }, retryCount * 5000);
          }
          //else { window.location.reload(); }
        });
    }, [selectedState, updatingDraws, retryCount]); 

    const dateAge = (startDate) => {
      const diffInMilliseconds = Math.abs(new Date() - new Date(startDate));
      return(Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24)));
    };

    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const displayDraws = !dataLoaded //lastDraws.every(element => EMPTY_DRAW.includes(element))
      ? <LoadingIndicator /> :
    lastDraws.map((item, index) => (
      <div className="mb-1" key={index}>
          <span className="text-stone-800 font-semibold">
          { item['Me']==='M' && <SvgMid color="text-green-500" /> }
          { item['Me']==='E' && <SvgEve color="text-green-500" /> } 
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
              {STATES.map((s, index) => (
                <option key={"st-opt-"+index} value={s.st}>{s.state} {s.game}</option>
              ))}
          </select>
          <button onClick={handleUpdateDraws} disabled={updatingDraws} className="px-2 py-1 font-semibold uppercase rounded text-stone-900 bg-amber-100 hover:bg-amber-500">
            { updatingDraws ? 'Updating ...' : 'Update Draws' }
          </button>
        </div>
        {displayDraws}
      </div>
    );
  }
  