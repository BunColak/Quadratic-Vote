import type { ActionArgs, LoaderArgs, SerializeFrom } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node'
import qs from 'qs';
import { useLoaderData } from '@remix-run/react';
import React from 'react'
import { PollForm, pollFormSchema } from '~/components/PollForm';
import { db } from '~/utils/prisma.server'
import { requireUserId } from '~/utils/session.server';
import { Container } from '@chakra-ui/react';

export const loader = async ({ params }: LoaderArgs) => {
    const pollId = params.pollId
    const poll = await db.poll.findFirst({ where: { id: pollId }, include: { options: true } })
    return json({ poll })
}

export const action = async ({ request, params }: ActionArgs) => {
    const pollId = params.pollId
    const userId = await requireUserId(request);
    const poll = await db.poll.findFirstOrThrow({ where: { id: pollId } })

    if (userId !== poll.authorId) {
        throw json("You do not have permission to edit this poll.")
    }

    const text = await request.text();
    const formValues = qs.parse(text)
    const result = pollFormSchema.safeParse(formValues)

    if (!result.success) {
        const errors = result.error.flatten()
        return json({ errors })
    }
    const { options, ...pollData } = result.data

    await db.poll.update({ where: { id: pollId }, data: pollData })

    options.filter(option => option.id).map(async option => {
        await db.option.update({ where: { id: option.id! }, data: { text: option.text } })
    })

    options.filter(option => !option.id).map(async option => {
        await db.option.create({ data: { text: option.text, pollId: poll.id } })
    })

    return redirect(`/polls/${pollId}`)
}

export type PollEditLoaderData = SerializeFrom<typeof loader>

const PollEdit = () => {
    const loaderData = useLoaderData<PollEditLoaderData>()
    return (
        <Container maxW="container.md" pt={10} pb={20}>
            <PollForm
                poll={loaderData.poll}
            />
        </Container>
    )
}

export default PollEdit