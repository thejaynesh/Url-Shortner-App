import * as React from 'react';

interface IFooterProps {
}

const Footer: React.FunctionComponent<IFooterProps> = () => {
  return (
    <div className='bg-slate-900 text-white text-base text-center py-5'>
        Copyright &#169; URLShortner |{' '}
        <a
          href="https://github.com/thejaynesh"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Jaynesh Bhandari (@thejaynesh)
        </a>
    </div>
  );
};

export default Footer;
