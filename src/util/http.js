import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export async function fetchData({ signal, url }) {
  console.log('fetchData', url);

  const response = await fetch(url, { signal: signal });

  if (!response.ok) {
    console.log('Error fetch response not ok', url);
    const error = new Error('An error occurred while fetching the data');
    error.code = response.status;
    console.log('Error code:', error.code);
    error.info = await response.json();
    console.log('Error info:', error.info);
    throw error;
  }

  const data = await response.json();
  //console.log(data);
  return data;
}
