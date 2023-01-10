import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/prisma.server";
import Voting from "~/components/Voting";
import CurrentStatus from "~/components/CurrentStatus";
import { useState } from "react";
import { Heading, Text, Link, SimpleGrid, Divider } from "@chakra-ui/react";


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
        voter: { credits, poll, name },
    } = useLoaderData<typeof loader>();
    const [currentCredits, setCredits] = useState(credits)

    return (
        <div>
            <div>
                <Heading>
                    Hi <Text as='span' color='blue.500'>{name}</Text>
                </Heading>
                <Heading mt={2}>
                    Voting for{" "}
                    <Link
                        color='teal.500'
                        as={RemixLink}
                        to={`/polls/${poll.id}`}
                    >
                        {poll.title}
                    </Link>
                </Heading>
                <Text color="gray.400" mt={2}>
                    {poll.description}
                </Text>
            </div>
            <Heading fontSize='2xl' mt={6}>
                Remaining Credits: <Text as='span' color='blue.500'>{currentCredits}</Text>
            </Heading>
            <Divider mt={6} />
            <SimpleGrid columns={[1,2]} gap={10} mt={4}>
                <div>
                    <Voting options={options} credits={currentCredits} updateCredits={setCredits} />
                </div>
                <div>
                    <CurrentStatus options={options} closed />
                </div>
            </SimpleGrid>
        </div>
    );
};

export default VotingPage;
