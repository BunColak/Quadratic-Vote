import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Navbar from "./components/Navbar";
import styles from "./styles/app.css";
import { getUserId } from "./utils/session.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Quadratic Voting",
  viewport: "width=device-width,initial-scale=1",
});

export type RootLoaderData = {
  clientId: string;
  redirectUri: string;
  isLoggedIn: boolean
};

export const loader: LoaderFunction = async ({ request }): Promise<RootLoaderData> => {
  const userId = await getUserId(request)

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Response("Please set Google credentials", { status: 400 });
  }

  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    isLoggedIn: !!userId
  };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <Navbar />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script
          async
          defer
          src="https://accounts.google.com/gsi/client"
        ></script>
        <LiveReload />
      </body>
    </html>
  );
}
