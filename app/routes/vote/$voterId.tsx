import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/prisma.server";
import Voting from "~/components/Voting";
import CurrentStatus from "~/components/CurrentStatus";
import { useState } from "react";


export const loader = async ({ params }: LoaderArgs) => {
  const { voterId } = params;

  const voter = await db.voter.findFirst({
    where: { id: voterId },
    include: { votes: true, poll: true },
  });

  if (!voter) {
    throw new Response("Voter not found", { status: 404 });
  }

  const options = await db.option.findMany({
    where: { pollId: voter.pollId },
    include: { vote: true },
  });

  const optionsWithVoteCount = options.map(option => {
    const myVotes = voter.votes.reduce(
      (acc, val) => (val.optionId === option.id ? acc + 1 : acc),
      0)
    return { ...option, myVotes }
  })

  return json({ voter, options: optionsWithVoteCount });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  title: `Voting for ${data.voter.poll.title}`,
});


const VotingPage = () => {
  const {
    options,
    voter: { credits, poll, name, id, votes },
  } = useLoaderData<typeof loader>();
  const [currentCredits, setCredits] = useState(credits)

  return (
    <div className="container p-2 mx-auto">
      <div className="text-center prose">
        <h2 className="my-6 text-3xl">
          Hi <span className="text-accent">{name}</span>
        </h2>
        <h2 className="my-6 text-3xl">
          Voting for{" "}
          <Link
            className="font-bold no-underline text-secondary"
            to={`/poll/${poll.id}`}
          >
            {poll.title}
          </Link>
        </h2>
        <p>{poll.description}</p>
      </div>
      <h3 className="text-3xl text-center lg:text-left">
        Remaining Credits: <span className="text-secondary">{currentCredits}</span>
      </h3>
      <div className="mt-8 grid grid-cols-3 gap-8">
        <div className="p-8 rounded bg-secondary3 col-span-3 lg:col-span-1">
          <Voting options={options} credits={currentCredits} updateCredits={setCredits} />
        </div>
        <div className="relative p-8 pb-16 rounded bg-secondary3 lg:col-span-2 col-span-3">
          <CurrentStatus options={options} closed />
          <div className="absolute text-right bottom-4 right-4">
            <h3 className="text-xl font-bold">{poll.title}</h3>
            <p className="text-sm">{poll.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
