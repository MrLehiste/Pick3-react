import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';

export default function ContentPanel({state, num, panelMonth, onMonthChange}) {
  const getNumberOfDaysInMonth = (month) => {
    if (month < 1 || month > 12) { return 'Invalid month number'; }
    const year = new Date().getFullYear(); // Get the current year
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    return lastDayOfMonth;
  };
  
  const [days, setDays] = useState(Array.from({ length: getNumberOfDaysInMonth(panelMonth) }, (_, index) => index + 1));

  const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
  const handleMonthChange = (event) => {
    onMonthChange(event.target.value);
    setDays(Array.from({ length: getNumberOfDaysInMonth(event.target.value) }, (_, index) => index + 1));
  };

  const panelUrl = 'https://pick3-function-api.azurewebsites.net/api/Panel?state='+state+'&num='+num+'&month='+panelMonth+'&code=jObvEG0duLEYTPf4ig4D0q6CiCicMZZJeDHbnamUnKsSTVGuj2FVLw==';
  const { data: panelData, isPending, isError, error } = useQuery({
    queryKey: [state, num, 'panel', panelMonth],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: panelUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let panelContent;
  if (isPending) { panelContent = <LoadingIndicator />; }
  if (isError) {
    panelContent = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch tablet data.'} />
    );
  }
  if (panelData) {
    panelContent = (<table className="min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th colSpan="6" scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
          <select value={panelMonth} onChange={handleMonthChange}>
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
            {[...new Set(panelData.map(item => new Date(item.Dt).getDate()))].sort((a, b) => a - b).map(d => (
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
  </tbody></table>);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-0 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              {panelContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
