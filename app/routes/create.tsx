import type { Voter } from "@prisma/client";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import qs from 'qs';
import { PollForm, pollFormSchema } from "~/components/PollForm";
import { db } from "~/utils/prisma.server";
import { getUserId, getUserNameByOauthId } from "~/utils/session.server";


export const meta: MetaFunction = () => ({
  title: "Create A New Poll",
});

export const action = async ({ request }: ActionArgs) => {
  const authorId = await getUserId(request);
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

  let voter: Voter | null = null

  if (authorId) {
    const name = await getUserNameByOauthId(authorId)
    voter = await db.voter.create({
      data: {
        pollId: newPoll.id,
        name,
        authorId,
        credits: newPoll!.initialCredits,
      },
    });
  }

  if (validatedValues.authorName) {
    voter = await db.voter.create({ data: { credits: validatedValues.initialCredits, name: validatedValues.authorName, poll: { connect: newPoll } } })
  }

  if (voter) {
    return redirect(`/vote/${voter.id}`);
  }

  return redirect(`/poll/${newPoll.id}`);
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)

  if (!userId) {
    throw json("You need to be logged in to create polls.", {status: 403})
  }

  return { userId }
}

export const CatchBoundary = () => {
  return <div>Gotcha!</div>
}

const CreatePoll = () => {
  const loaderData = useLoaderData<typeof loader>()
  return <PollForm isLoggedIn={!!loaderData.userId} />
};

export default CreatePoll;
