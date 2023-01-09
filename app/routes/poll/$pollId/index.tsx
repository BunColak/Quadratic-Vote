import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Grid, GridItem, Heading, HStack, Text } from "@chakra-ui/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import CurrentStatus from "~/components/CurrentStatus";
import PollShare from "~/components/PollShare";
import Voters from "~/components/Voters";
import { db } from "~/utils/prisma.server";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = ({ data }) => ({
    title: `Poll: ${data?.poll?.title}`,
});

export const loader = async ({
    params,
    request,
}: LoaderArgs) => {
    const oauthId = await requireUserId(request);
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

    myVotePageId = voters.find((voter) => voter.authorId === oauthId)?.id;

    return { poll, voters, options, currentUrl: (new URL(request.url)).origin, myVotePageId, isAuthor };
};

const PollDetails = () => {
    const { poll, options, myVotePageId, isAuthor } = useLoaderData<typeof loader>();

    return (
        <div>
            <div>
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
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem colSpan={1}>
                        <CurrentStatus options={options} />
                    </GridItem>
                    <GridItem>
                        <Button
                            size="lg"
                            colorScheme="blue"
                            rightIcon={<ArrowForwardIcon />}
                            as={Link}
                            to={`/vote/${myVotePageId}`}
                        >
                            Go to voting
                        </Button>
                        <Voters />
                    </GridItem>
                </Grid>

            </Box>
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
