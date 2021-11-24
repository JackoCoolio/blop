import "Styles/globals.scss"
import { BlopNavbar } from "Components/BlopNavbar"
import Head from "next/head"

import type { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  // this is the body component
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/dotsLogo.ico" />
        <title>Blop</title>
      </Head>
      <div id="blop">
        <BlopNavbar />
        <div id="blopContent">
          <Component {...pageProps} />
        </div>
      </div>
    </>
  )
}
export default MyApp
