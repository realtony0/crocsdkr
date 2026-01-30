import NextError from 'next/error';

export default function Custom404() {
  return <NextError statusCode={404} />;
}
