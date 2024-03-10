import React, { useState, useEffect } from 'react';

const INIT_TABLET = []
  
  export default function ContentTablet({state, num}) {
    const [magicData, setMagicData] = useState(INIT_TABLET);
    const [historyData, setHistoryData] = useState(INIT_TABLET);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const tabletUrl = 'https://pick3-function-api.azurewebsites.net/api/Tablet?state='+state+'&num='+num+'&code=qI7zCr8IIxaYSP1MQPuYzgkaobbTE/yLErVUx8lD6jy2BHV2hpllqw==';
        fetch(tabletUrl)
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

        const historyUrl = 'https://pick3-function-api.azurewebsites.net/api/Tablet?h=1&state='+state+'&num='+num+'&code=qI7zCr8IIxaYSP1MQPuYzgkaobbTE/yLErVUx8lD6jy2BHV2hpllqw==';
        fetch(historyUrl)
          .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok.'); }
            return response.json();
          })
          .then(data => { 
            //console.log(data); 
            setHistoryData(data); 
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
      }, [state, num]); 

    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
    function classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }

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
                        Num ({magicData.filter(magic => magic.Me === "M").length})
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Mid
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Num ({magicData.filter(magic => magic.Me === "E").length})
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Eve
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {magicData.map((magic) => (
                      <tr key={magic.Num + magic.Date}>
                        {magic.Me === "E" && <><td /><td /><td /></> }
                        <td 
                        className={classNames(
                          (magic.Me == "M") ? '' : '',
                          'whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'
                        )}>
                          {magic.Num}
                        </td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(magic.Date).toLocaleDateString('en-US', dateOptions)}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{magic.Me}</td>
                        {magic.Me === "M" && <><td /><td /><td /></> }
                      </tr>
                    ))}
                  </tbody>
                  <thead className="bg-gray-50">
                    <tr>
                      <th colSpan={2} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        
                      </th>
                      <th scope="col" className="py-3.5 text-left text-sm font-semibold text-gray-900">
                        Num ({historyData.length})
                      </th>
                      <th colSpan={2} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {historyData.map((magic) => (
                      <tr key={magic.Num + magic.Date}>
                        <td colSpan={2}></td>
                        <td className='whitespace-nowrap py-1 pr-3 text-sm font-medium text-gray-900'>
                          {magic.Num}
                        </td>
                        <td colSpan={2} className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{new Date(magic.Date).toLocaleDateString('en-US', dateOptions)}</td>
                        <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500"></td>
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
  