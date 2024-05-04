import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';

export default function DrawsScramble({state, num}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
  const handleMonthChange = (event) => { setCurrentMonth(event.target.value); };

  const scrambleUrl = import.meta.env.VITE_URL_SCRAM + '&month='+currentMonth+'&state='+state+'&num='+num;
  const { data: scrambleData, isPending, isError, error } = useQuery({
    queryKey: [state, num, 'scramble', currentMonth],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: scrambleUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let scrambleContent;
  if (isPending) { scrambleContent = <LoadingIndicator />; }
  if (isError) {
    scrambleContent = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch scramble data.'} />
    );
  }
  if (scrambleData) {
    scrambleContent = (<table className="min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
          <span className="flex items-center">
            <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
              {scrambleData.length}
            </span> 
            <span className='ml-1'>Nums</span>
          </span>
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
      {scrambleData.map((d) => (
        <tr key={d.Num + d.Dt + d.Me}>
          <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
            {d.Num}
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(d.Dt).toLocaleDateString('en-US', dateOptions)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{d.Me}</td>
          
        </tr>
      ))}
    </tbody>
  </table>);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-0 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              {scrambleContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
