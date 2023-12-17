import Document, {
  DocumentContext,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

interface Props extends DocumentProps {
  darkMode: boolean;
}

class MyDocument extends Document<Props> {
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx);

  //   const userAgent = ctx.req?.headers['user-agent'];
  //   const darkMode = userAgent?.match(/dark-mode/) ? true : false;

  //   return { ...initialProps, darkMode };
  // }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
