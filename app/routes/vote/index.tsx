import type {ActionFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {db} from "~/utils/prisma.server";
import {requireUserId} from "~/utils/session.server";
import {z} from "zod";
import {voteDiffSchema} from "~/components/Voting";

const voteSchema = z.object({
    options: voteDiffSchema,
    credits: z.number(),
    pollId: z.string()
})

export const action: ActionFunction = async ({request}) => {
    const authorId = await requireUserId(request)

    const formData = await request.formData()
    const stringData = formData.get('data')
    if (!stringData || typeof stringData !== "string") {
        throw json({error: "Bad Request"}, 400);
    }

    const data = voteSchema.parse(JSON.parse(stringData))
    const options = data.options
    const credits = data.credits
    const pollId = data.pollId

    const voter = await db.voter.findFirst({where: {authorId, pollId}})

    if (!voter) {
        throw json({error: "Voter not found."}, {status: 404})
    }

    options.map(async (option) => {

        if (option.change > 0) {
            await db.vote.createMany({
                data: [...Array(option.change)].map(_ => ({
                    voterId: voter.id,
                    optionId: option.optionId
                }))
            })
        } else if (option.change < 0) {
            const existingVotes = await db.vote.findMany({
                where: {voter, optionId: option.optionId},
                select: {id: true},
            });
            [...Array(Math.abs(option.change))].map(async (_, index) => {
                const toDelete = existingVotes[existingVotes.length - index - 1]
                if (!toDelete) {
                    return
                }
                return db.vote.delete({
                    where: {id: toDelete.id},
                    select: null
                })
            })
        }

        return null
    })

    await db.voter.update({where: {id: voter.id}, data: {credits: Number(credits)}})

    return null
}