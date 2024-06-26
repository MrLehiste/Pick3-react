import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import SvgEve from './SvgEve.jsx';
import SvgMid from './SvgMid.jsx';

export default function DrawsTablet({state, num}) {
  const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }

  const tabletUrl = import.meta.env.VITE_URL_TABLET + '&state='+state+'&num='+num;
  const historyUrl = import.meta.env.VITE_URL_TABLET + '&h=1&state='+state+'&num='+num;

  const { data: tabletData, isPending, isError, error } = useQuery({
    queryKey: [state, num, 'tablet'],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: tabletUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let tabletContent;
  if (isPending) { tabletContent = <LoadingIndicator />; }
  if (isError) {
    tabletContent = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch tablet data.'} />
    );
  }
  if (tabletData) {
    tabletContent = (<table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
            <span className="flex items-center">
              <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
                {tabletData.filter(d => d.Me === "M").length}
              </span> 
              <span className='ml-1'>Draws</span>
            </span>
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            Date
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            <span><SvgMid /> Mid</span>
          </th>
          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
            <span className="flex items-center">
              <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
                {tabletData.filter(d => d.Me === "E").length}
              </span> 
              <span className='ml-1'>Draws</span>
            </span>
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            Date
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            <span><SvgEve /> Eve</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {tabletData.map((d) => (
          <tr key={"dtblt-tr-"+d.Num + d.Dt}>
            {d.Me === "E" && <><td /><td /><td /></> }
            <td 
            className={classNames(
              (d.Me == "M") ? '' : '',
              'whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'
            )}>
              {d.Num}
            </td>
            <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(d.Dt).toLocaleDateString('en-US', dateOptions)}</td>
            <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
              {d.Me=="M" && <span><SvgMid /> Mid</span>}
              {d.Me=="E" && <span><SvgEve /> Eve</span>}
            </td>
            {d.Me === "M" && <><td /><td /><td /></> }
          </tr>
        ))}
      </tbody>
    </table>);
  }

  const { data: historyData, isPending: historyIsPending, isError: historyIsError, error: historyError } = useQuery({
    queryKey: [state, num, 'tablet-h'],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: historyUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let historyContent;
  if (historyIsPending) { historyContent = <LoadingIndicator />; }
  if (historyIsError) {
    historyContent = (
      <ErrorBlock title="An error occurred" message={historyError.info?.message || 'Failed to fetch history data.'} />
    );
  }
  if (historyData && historyData.length > 0) {
    historyContent = (<table className="min-w-full divide-y divide-gray-300"><thead className="bg-gray-50">
    <tr>
      <th colSpan={2} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
        
      </th>
      <th scope="col" className="py-3.5 text-left text-sm font-semibold text-gray-900">
        <span className="flex items-center">
          <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
            {historyData.length}
          </span> 
          <span className='ml-1'>Draws</span>
        </span>
      </th>
      <th colSpan={2} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
        Date
      </th>
      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
        
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200 bg-white">
    {historyData.map((h, index) => (
      <tr key={"dtblt-hist-"+h.Num + h.Dt + index}>
        <td colSpan={2}></td>
        <td className='whitespace-nowrap py-1 pr-3 text-sm font-medium text-gray-900'>
          {h.Num}
        </td>
        <td colSpan={2} className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(h.Dt).toLocaleDateString('en-US', dateOptions)}</td>
        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500"></td>
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
                {tabletContent}
                {historyContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  