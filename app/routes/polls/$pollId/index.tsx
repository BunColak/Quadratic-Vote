import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import CurrentStatus from "~/components/CurrentStatus";
import PollShare from "~/components/PollShare";
import Voters from "~/components/Voters";
import { db } from "~/utils/prisma.server";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = ({ params }) => ({
    title: `Quadratic Vote Poll`,
});

const getData = async (pollId: string, oauthId: string) => {
    await new Promise(res => setTimeout(() => res(0), 3000))
    let myVotePageId: string | undefined = undefined;
    const poll = await db.poll.findFirst({
        where: { id: pollId },
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
        where: { pollId: pollId },
        include: { vote: true },
        orderBy: { vote: { _count: "desc" } },
    });
    
    myVotePageId = voters.find((voter) => voter.authorId === oauthId)?.id;
    return { poll, voters, options, myVotePageId, isAuthor };
}

export const loader = async ({
    params,
    request,
}: LoaderArgs) => {
    const oauthId = await requireUserId(request);
    const data = getData(params.pollId!, oauthId)

    const currentUrl = (new URL(request.url)).origin

    return defer({ data, currentUrl })
}

const PollDetails = () => {
    const data = useLoaderData<typeof loader>();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={data.data} errorElement={<div>Oopsie</div>}>
                {({ isAuthor, options, poll, voters, myVotePageId }) => {
                    return <><div>
                        <HStack spacing={6}>
                            <Heading>{poll.title}</Heading>
                            {isAuthor && <Button
                                as={Link}
                                to={`edit`}
                                colorScheme="teal"
                            >
                                Edit Poll
                            </Button>}
                        </HStack>
                        <Text color="gray.400" mt={2}>
                            {poll.description}
                        </Text>
                        <PollShare />
                    </div>
                        <Box mt={8}>
                            <SimpleGrid columns={[1, 2]} gap={6}>
                                <CurrentStatus options={options} />
                                <Box>
                                    <Button
                                        size="lg"
                                        w={['full', 'auto']}
                                        colorScheme="blue"
                                        rightIcon={<ArrowForwardIcon />}
                                        as={Link}
                                        to={`vote/${myVotePageId}`}
                                    >
                                        Go to voting
                                    </Button>
                                    <Voters />
                                </Box>
                            </SimpleGrid>

                        </Box>
                    </>
                }}
            </Await>
        </Suspense>
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
