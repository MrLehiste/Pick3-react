import React, { useState, useEffect } from 'react';

const INIT_MAGIC = [];
const panel_magic = [
    { Num: '000', Date: '01/01/1001', Me: '' },
    { Num: '001', Date: '01/01/1001', Me: '' },
    { Num: '002', Date: '01/01/1001', Me: '' },
    { Num: '003', Date: '01/01/1001', Me: '' },
    { Num: '004', Date: '01/01/1001', Me: '' },
    { Num: '005', Date: '01/01/1001', Me: '' },
    { Num: '006', Date: '01/01/1001', Me: '' },
    { Num: '007', Date: '01/01/1001', Me: '' },
    { Num: '008', Date: '01/01/1001', Me: '' },
    { Num: '009', Date: '01/01/1001', Me: '' },
  ]
  
  export default function ContentMagic({state, num}) {
    const [magicData, setMagicData] = useState(INIT_MAGIC);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const magicUrl = 'https://pick3-function-api.azurewebsites.net/api/Magic?state='+state+'&num='+num+'&code=JuT2P1rGtna9B7Dr3SlM425MA7yWRY0/3BFeeiJ9LMVIZw2H3sisNg==';
        fetch(magicUrl)
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
      }, [state, num]); 

    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };

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
                        Num
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        M/P
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {magicData.map((magic) => (
                      <tr key={magic.Num}>
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
  