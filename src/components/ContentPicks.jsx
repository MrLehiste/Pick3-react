import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

const INIT_SCRAMBLE = []
  
  export default function ContentPicks({state, num}) {
    const [picksData, setPicksData] = useState(INIT_SCRAMBLE);
    const [retryCount, setRetryCount] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 2);
    const [maxDate, setMaxDate] = useState(new Date() + 1);
    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };

    useEffect(() => {
        const strMaxDate = new Date(maxDate).toLocaleDateString('en-US', dateOptions);
        const picksUrl = 'https://pick3-function-api.azurewebsites.net/api/Picks?month='+currentMonth+'&state='+state+'&num='+num+'&maxdt='+strMaxDate+'&code=sR8PRXHdJzeNXCQ9oZiqTLFqAHcFY4TnEEOgoipdG2KDOQNSOx2ROg==';
        console.log(picksUrl);
        fetch(picksUrl)
          .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok.'); }
            return response.json();
          })
          .then(data => { 
            //console.log(data); 
            setPicksData(data); 
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
      }, [state, num, currentMonth, maxDate]); 

    const handleMonthChange = (event) => {
      setCurrentMonth(event.target.value);
    };
    const handleDateChange = (date) => {
      setMaxDate(date);
      //console.log('Date changed', date);
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
                      <th colSpan="4" scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {picksData.length} Picks for: <select value={currentMonth} onChange={handleMonthChange}>
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
                      <th colSpan="3" scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Picks as of: <DatePicker
                          selected={maxDate}
                          onChange={handleDateChange}
                          //dateFormat="yyyy-MM-dd" // Customize date format if needed
                        />
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Date
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Q
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Num
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        M/P
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Squiqqly
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Scramble
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Calendar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {picksData.map((pick) => (
                      <tr key={pick.Calendar}>
                        <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {pick.Day}
                        </td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{pick.Q}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{pick.Num}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{pick.Magic}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{pick.Squiggly}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{pick.Scramble}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500"><a href={pick.Calendar}>Add to Calendar</a></td>
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
  