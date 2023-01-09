import type {Poll} from "@prisma/client";
import type {LoaderFunction} from "@remix-run/node";
import React from "react";
import HomeHeader from "~/components/HomeHeader";
import {db} from "~/utils/prisma.server";
import {getUserId, getUserNameByOauthId} from "~/utils/session.server";

export type HomeLoaderData = {
    polls: Poll[];
    username: string | null;
};

export const loader: LoaderFunction = async ({
                                                 request,
                                             }): Promise<HomeLoaderData> => {
    const oauthId = await getUserId(request);
    let username: HomeLoaderData["username"] = null;

    let polls: Poll[] = [];

    if (oauthId) {
        polls = await db.poll.findMany({
            where: {
                OR: [
                    {authorId: oauthId},
                    {voters: {some: {authorId: oauthId}}},
                ],
            },
            orderBy: {id: 'desc'}
        });
        username = await getUserNameByOauthId(oauthId);
    }

    return {
        polls,
        username: username ? username?.split(" ")[0] : null,
    };
};

const Home = () => {
    return <HomeHeader/>
};

export default Home;
