import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import { classNames, DATE_OPT_MDY4, DATE_OPT_DAY_LONG } from './UI/constants';
import SvgEve from './SvgEve.jsx';
import SvgMid from './SvgMid.jsx';

export default function DrawsHistory({ state, dtFrom, dtTo }) {
  const drawsUrl = import.meta.env.VITE_URL_DRAWS + '&state='+state+'&from='+dtFrom+'&to='+dtTo;
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, 'draws', dtFrom, dtTo],
    queryFn: ({ signal }) => fetchData({ signal, url: drawsUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let resultsTable;
  if (isPending) { resultsTable = <LoadingIndicator />; }
  if (isError) {
    resultsTable = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch scramble data.'} />
    );
  }
  if (data) {
    resultsTable = (<table className="min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" colSpan={2} className="rounded-tl-lg py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
          <span className="flex items-center">
            <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
              {data.length}
            </span> 
            <span className='ml-1'>Draws</span>
          </span>
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Date
        </th>
        <th scope="col" className="rounded-tr-lg px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Mid/Eve
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {data.map((d, index) => (
        <tr key={"dhist-tr-"+d.Num + d.Dt + d.Me}>
          <td className={classNames( (index==data.length-1) ? "rounded-bl-lg " : "", "whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6")}>
            {d.Num} 
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {new Date(d.Dt).toLocaleDateString('en-US', DATE_OPT_DAY_LONG)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {new Date(d.Dt).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className={classNames( (index==data.length-1) ? "rounded-br-lg " : "", "whitespace-nowrap px-3 py-1 text-sm text-gray-500")}>
            {d.Me=="M" && <span><SvgMid /> Mid</span>}
            {d.Me=="E" && <span><SvgEve /> Eve</span>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>);
  }

  return resultsTable;
}
