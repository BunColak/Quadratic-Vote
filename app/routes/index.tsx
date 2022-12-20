import type { Poll } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import ExistingPolls from "~/components/ExistingPolls";
import HomeHeader from "~/components/HomeHeader";
import RedirectJoinForm from "~/components/RedirectJoinForm";
import { db } from "~/utils/prisma.server";
import { getUserId, getUserNameByOauthId } from "~/utils/session.server";

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
          { authorId: oauthId },
          { voters: { some: { authorId: oauthId } } },
        ],
      },
    });
    username = await getUserNameByOauthId(oauthId);
  }

  return {
    polls,
    username: username ? username?.split(" ")[0] : null,
  };
};

const Home = () => {
  const loaderData = useLoaderData<HomeLoaderData>()

  return (
    <div className="container p-4 mx-auto">
      <div className="fixed top-0 left-0 w-full h-full bg-primary -z-10" />
      <div className="grid grid-cols-12 gap-2 mt-[5vh] z-20">
        <div className="col-span-5 -z-10">
          <div className="home-image" />
        </div>
        <div className="text-white lg:col-span-7 col-span-12">
          <HomeHeader />
          <h3 className="text-secondary3 text-2xl mt-[10vh]">Your Existing Polls</h3>
          <div className="flex flex-wrap justify-between mt-8 space-y-8 lg:space-y-0">
            <div className="flex-grow md:ml-[10vw] md:order-2">
              {loaderData.username ? <RedirectJoinForm /> : null}
            </div>
            <div className="md:order-1 md:basis-2/5 basis-full">
              <ExistingPolls />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
