// root.tsx
import React, {useContext, useEffect} from 'react'
import {withEmotionCache} from '@emotion/react'
import {ChakraProvider} from '@chakra-ui/react'
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from '@remix-run/react'
import {MetaFunction, LinksFunction, LoaderFunction} from '@remix-run/node' // Depends on the runtime you choose

import {ServerStyleContext, ClientStyleContext} from './context'
import Navbar from "~/components/Navbar";
import {getUserId} from "~/utils/session.server";

export type RootLoaderData = {
    clientId: string;
    redirectUri: string;
    isLoggedIn: boolean
};

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'New Remix App',
    viewport: 'width=device-width,initial-scale=1',
});

export let links: LinksFunction = () => {
    return [
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com'},
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap'
        },
    ]
}

export const loader: LoaderFunction = async ({request}): Promise<RootLoaderData> => {
    const userId = await getUserId(request)

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
        throw new Response("Please set Google credentials", {status: 400});
    }

    return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        isLoggedIn: !!userId
    };
};


interface DocumentProps {
    children: React.ReactNode;
}

const Document = withEmotionCache(
    ({children}: DocumentProps, emotionCache) => {
        const serverStyleData = useContext(ServerStyleContext);
        const clientStyleData = useContext(ClientStyleContext);

        // Only executed on client
        useEffect(() => {
            // re-link sheet container
            emotionCache.sheet.container = document.head;
            // re-inject tags
            const tags = emotionCache.sheet.tags;
            emotionCache.sheet.flush();
            tags.forEach((tag) => {
                (emotionCache.sheet as any)._insertTag(tag);
            });
            // reset cache to reapply global styles
            clientStyleData?.reset();
        }, []);

        return (
            <html lang="en">
            <head>
                <Meta/>
                <Links/>
                {serverStyleData?.map(({key, ids, css}) => (
                    <style
                        key={key}
                        data-emotion={`${key} ${ids.join(' ')}`}
                        dangerouslySetInnerHTML={{__html: css}}
                    />
                ))}
            </head>
            <body>
            <Navbar/>
            {children}
            <ScrollRestoration/>
            <Scripts/>
            <LiveReload/>
            <script
                async
                defer
                src="https://accounts.google.com/gsi/client"
            ></script>
            </body>
            </html>
        );
    }
);

export default function App() {
    return (
        <Document>
            <ChakraProvider>
                <Outlet/>
            </ChakraProvider>
        </Document>
    )
}