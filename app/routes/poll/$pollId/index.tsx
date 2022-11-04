import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import CurrentStatus from "~/components/CurrentStatus";
import PollShare from "~/components/PollShare";
import Voters from "~/components/Voters";
import { db } from "~/utils/prisma.server";
import { getUserId } from "~/utils/session.server";

export const meta: MetaFunction = ({ data }) => ({
    title: `Poll: ${data?.poll?.title}`,
});

export const loader = async ({
    params,
    request,
}: LoaderArgs) => {
    const oauthId = await getUserId(request);
    let myVotePageId: string | undefined = undefined;
    const poll = await db.poll.findFirst({
        where: { id: params.pollId },
    });
    const isAuthor = oauthId === poll?.authorId

    if (!poll) {
        throw new Response("Poll Not found", { status: 404 });
    }

    const voters = await db.voter.findMany({
        where: { pollId: poll.id },
        include: { votes: true },
    });

    const options = await db.option.findMany({
        where: { pollId: params.pollId },
        include: { vote: true },
        orderBy: { vote: { _count: "desc" } },
    });

    if (oauthId) {
        myVotePageId = voters.find((voter) => voter.authorId === oauthId)?.id;
    }

    return { poll, voters, options, currentUrl: (new URL(request.url)).origin, myVotePageId, isAuthor };
};

const PollDetails = () => {
    const { poll, options, myVotePageId, isAuthor } = useLoaderData<typeof loader>();

    return (
        <div className="container p-4 mx-auto">
            <div className="prose">
                <h1 className="my-8 text-center text-secondary">{poll.title}</h1>
                <PollShare />
            </div>
            <div className="grid grid-cols-12 min-h-[50vh] mt-[5vh]">
                <div className="col-span-12 lg:col-span-6">
                    <CurrentStatus options={options} />
                </div>
                <div className="flex flex-col col-span-12 prose lg:col-span-6 prose-p:m-0 prose-h3:m-0 prose-table:m-0">
                    <p>{poll.description}</p>
                    <Link
                        className="block mt-4 text-center no-underline uppercase btn bg-accent3 lg:order-2"
                        to={`/vote/${myVotePageId}`}
                    >
                        My Vote Page For {poll.title}
                    </Link>
                    {isAuthor && <Link
                        className="block mt-4 text-center no-underline uppercase btn bg-primary text-white lg:order-2"
                        to={`edit`}
                    >
                        Edit Poll
                    </Link>}
                    <Voters />
                </div>
            </div>
        </div>
    );
};

export function CatchBoundary() {
    return (
        <div>
            <p>No Poll found</p>
        </div>
    );
}

export default PollDetails;
