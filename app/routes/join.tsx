import { Box, Center, Container, Heading, Text } from "@chakra-ui/react";
import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction
} from "@remix-run/node";
import {
  json
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import React from "react";
import CenteredError from "~/components/CenteredError";
import JoinForm from "~/components/JoinForm";
import { db } from "~/utils/prisma.server";
import { getUserId, getUserNameByOauthId, requireUserId } from "~/utils/session.server";


export const meta: MetaFunction = ({ data }) => ({
  title: `Joining Poll ${data?.poll?.title || " "}`,
});

export const loader = async ({
  request,
}: LoaderArgs) => {
  const userId = await getUserId(request);

  // TODO Test
  if (!userId) {
    throw json("You need to login to join a poll.", { status: 403 })
  }

  const username = await getUserNameByOauthId(userId);
  const url = new URL(request.url);
  const pollId = url.searchParams.get("pollId");

  // TODO Test
  if (!pollId) throw json("Poll not found!", { status: 404 });

  const poll = await db.poll.findFirst({
    where: { id: pollId },
  });

  // TODO Test
  if (!poll) throw json("Poll not found!", { status: 404 });

  // TODO Test
  const userAlreadyInPoll = (await db.voter.count({ where: { authorId: userId, pollId: pollId } })) > 0
  if (userAlreadyInPoll) throw redirect(`/polls/${pollId}`)

  return {
    poll,
    username,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const authorId = await requireUserId(request);

  const formData = await request.formData();
  const formValues = Object.fromEntries(formData.entries());
  const pollId = formValues.pollId as string;
  let name = formValues.name as string;

  name = await getUserNameByOauthId(authorId);

  const poll = await db.poll.findFirst({
    where: { id: pollId },
    select: { initialCredits: true },
  });

  const newVoter = await db.voter.create({
    data: {
      pollId,
      name,
      credits: poll!.initialCredits,
      authorId,
    },
  });

  return redirect(`/vote/${newVoter.id}`);
};

const Join = () => {
  const { poll, username } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Box textAlign='center' mt={8}>
        <Heading>
          Hi <Text as='span' color='blue.500'>{username}</Text>
        </Heading>
        <Heading fontSize='2xl' mt={4}>
            Joining Poll <Text as='span' color='teal.500'>{poll.title}</Text>
        </Heading>
      </Box>
      <Center mt={6}>
        <JoinForm />
      </Center>
    </Container>
  );
};

export function CatchBoundary() {
  const catchResponse = useCatch()

  return (
    <CenteredError text={catchResponse.data} redirectTo={catchResponse.status === 403 ? '/' : undefined} redirectText="Go To Homepage" />
  );
}

export default Join;
