import React, { useState, useEffect } from 'react';

const INIT_SCRAMBLE = []
  
  export default function ContentScramble({state, num}) {
    const [magicData, setMagicData] = useState(INIT_SCRAMBLE);
    const [retryCount, setRetryCount] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);


    useEffect(() => {
        const scrambleUrl = 'https://pick3-function-api.azurewebsites.net/api/Scramble?month='+currentMonth+'&state='+state+'&num='+num+'&code=TkGrt/859Mk639WEfzuXhoLdWUYSrQWOzFc7ZE/viTYtkB/LUcLRWg==';
        fetch(scrambleUrl)
          .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok.'); }
            return response.json();
          })
          .then(data => { 
            //console.log(data); 
            setMagicData(data); 
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
      }, [currentMonth, state, num]); 

    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const handleMonthChange = (event) => {
      setCurrentMonth(event.target.value);
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
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Num ({magicData.length})
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        <select value={currentMonth} onChange={handleMonthChange}>
                          <option value="0">-- All --</option>
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
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Mid/Eve
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {magicData.map((magic) => (
                      <tr key={magic.Num + magic.Date + magic.Me}>
                        <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {magic.Num}
                        </td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(magic.Date).toLocaleDateString('en-US', dateOptions)}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{magic.Me}</td>
                        
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
  