import NextError from 'next/error';

export default function Error({ statusCode }) {
  return <NextError statusCode={statusCode} />;
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
}
