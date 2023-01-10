import { Container } from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import qs from 'qs';
import CenteredError from "~/components/CenteredError";
import { PollForm, pollFormSchema } from "~/components/PollForm";
import { db } from "~/utils/prisma.server";
import { getUserId, getUserNameByOauthId, requireUserId } from "~/utils/session.server";


export const meta: MetaFunction = () => ({
  title: "Create A New Poll",
});

export const action = async ({ request }: ActionArgs) => {
  const authorId = await requireUserId(request);
  const text = await request.text();

  const formValues = qs.parse(text)

  const result = pollFormSchema.safeParse(formValues)

  if (!result.success) {
    const errors = result.error.flatten()
    return json({ errors })
  }
  const validatedValues = result.data

  const newPoll = await db.poll.create({
    data: {
      title: validatedValues.title,
      initialCredits: validatedValues.initialCredits,
      description: validatedValues.description,
      authorId,
      options: {
        create: validatedValues.options?.map((option) => ({
          text: option.text,
        })),
      },
    },
  });


  const name = await getUserNameByOauthId(authorId)
  const voter = await db.voter.create({
    data: {
      pollId: newPoll.id,
      name,
      authorId,
      credits: newPoll!.initialCredits,
    },
  });

  return redirect(`/vote/${voter.id}`);
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)

  if (!userId) {
    throw json("You need to be logged in to create polls.", { status: 403 })
  }

  return { userId }
}

export const CatchBoundary = () => {
  const catchResponse = useCatch()

  return <CenteredError text={catchResponse.data} redirectText="Go To Homepage" redirectTo="/" />
}

const CreatePoll = () => {
  const loaderData = useLoaderData<typeof loader>()
  return <Container maxW="container.md" pt="10" pb={20}>
    <PollForm isLoggedIn={!!loaderData.userId} />
  </Container>
};

export default CreatePoll;
