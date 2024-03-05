export default function Input({ label, invalid, ...props }) {
  let labelClasses = 'block text-xs font-bold tracking-wide uppercase';
  let inputClasses = 'w-full px-3 py-2 leading-tight border rounded shadow';

  if (invalid) {
    labelClasses += ' text-red-400';
    inputClasses += ' text-red-500 bg-red-100 border-red-300';
  } else {
    labelClasses += ' text-stone-300';
    inputClasses += ' text-gray-700 bg-stone-100';
  }

  return (
    <p>
      <label className='block text-xs font-bold tracking-wide uppercase text-stone-300'>
        {label}</label>
      <input className='w-full px-3 py-2 leading-tight border rounded shadow text-gray-700 bg-stone-100' 
        {...props} />
    </p>
  );
}
