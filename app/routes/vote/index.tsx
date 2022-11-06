import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import qs from 'qs'
import { db } from "~/utils/prisma.server";

export const action: ActionFunction = async ({ request }) => {
    const text = await request.text()
    const data = qs.parse(text)
    if (!data.options) {
        return json("Error!")
    }
    const options = JSON.parse(data.options as string) as { change: number, optionId: number, voterId: string }[]
    const credits = data.credits

    options.map(async (option) => {
        const { voterId, optionId } = option

        if (option.change > 0) {
            await db.vote.createMany({ data: [...Array(option.change)].map(_ => ({ voterId, optionId })) })
        } else if (option.change < 0) {
            const existingVotes = await db.vote.findMany({
                where: { voterId, optionId },
                select: { id: true },
            });
            [...Array(Math.abs(option.change))].map(async (_, index) => {
                const toDelete = existingVotes[existingVotes.length - index - 1]
                if (!toDelete) {
                    return
                }
                return db.vote.delete({
                    where: { id: toDelete.id },
                    select: null
                })
            })
        }

        return null
    })

    await db.voter.update({ where: { id: options[0].voterId }, data: { credits: Number(credits) } })

    return null
}