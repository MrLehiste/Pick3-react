import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';

export default function ContentMagic({state, num, onNumberClick}) {
  const url = import.meta.env.VITE_URL_MAGIC + '&state='+state+'&num='+num;
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, num, 'magic'],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  const handleNumberClick = (num) => { onNumberClick(num); };

  const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };

  let content;
  if (isPending) { content = <LoadingIndicator />; }
  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch magic data.'} />
    );
  }
  if (data) {
    content = (<>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Num
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Date
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data && data.map((magic) => (
            <tr key={magic.Num}>
              <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <button onClick={() => handleNumberClick(magic.Num)}>{magic.Num}</button>
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(magic.Date).toLocaleDateString('en-US', dateOptions)}</td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{magic.Me}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </>);
  }


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-0 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
