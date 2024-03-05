import React, { useState, useEffect } from 'react';

const INIT_PANEL = []
  
  export default function ContentPanel({state, num}) {
    const getNumberOfDaysInMonth = (month) => {
      if (month < 1 || month > 12) { return 'Invalid month number'; }
      const year = new Date().getFullYear(); // Get the current year
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      return lastDayOfMonth;
    };
    const [panelData, setPanelData] = useState(INIT_PANEL);
    const [retryCount, setRetryCount] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [days, setDays] = useState(Array.from({ length: getNumberOfDaysInMonth(new Date().getMonth() + 1) }, (_, index) => index + 1));
    const [panelDays, setPanelDays] = useState([]);

    useEffect(() => {
        const panelUrl = 'https://pick3-function-api.azurewebsites.net/api/Panel?state='+state+'&num='+num+'&month='+currentMonth+'&code=jObvEG0duLEYTPf4ig4D0q6CiCicMZZJeDHbnamUnKsSTVGuj2FVLw==';
        fetch(panelUrl)
          .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok.'); }
            return response.json();
          })
          .then(data => { 
            //console.log(data); 
            setPanelData(data); 
            setPanelDays( [...new Set(data.map(item => new Date(item.Dt).getDate()))].sort((a, b) => a - b) );
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
      }, [state, num, currentMonth]); 

    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const handleMonthChange = (event) => {
      setCurrentMonth(event.target.value);
      setDays(Array.from({ length: getNumberOfDaysInMonth(event.target.value) }, (_, index) => index + 1));
    };

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-0 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th colSpan="6" scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                        <select value={currentMonth} onChange={handleMonthChange}>
                          <option value="1">January</option>
                          <option value="2">Febrary</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                        <td rowSpan={panelData.length + 1} className='py-1 px-1 ml-1'>
                          <ul>
                            {panelDays.map(d => (
                              <li key={d}  className="flex items-center justify-center rounded-full bg-red-500 mb-1 px-2 py-1 text-white font-bold"><span>{d}</span></li>
                            ))}
                          </ul>
                        </td>
                    </tr>
                    {panelData.map((p) => (
                      <tr key={p.Num + p.Dt}>
                        <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {p.Q}
                        </td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(p.Dt).toLocaleDateString('en-US', dateOptions)}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{p.Num}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{p.Num2 && new Date(p.Dt2).toLocaleDateString('en-US', dateOptions)}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{p.Num2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  