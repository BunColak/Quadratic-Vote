import type {Option} from "@prisma/client";
import type {SerializeFrom} from "@remix-run/node";
import {useFetcher} from "@remix-run/react";
import React, {useMemo, useState} from "react";
import {useImmer} from "use-immer";
import {z} from "zod";

type VotingProps = {
    options: SerializeFrom<(Option & { myVotes: number })[]>;
    credits: number
    updateCredits: (cred: number) => void
};

export const voteDiffSchema = z.array(z.object({
    optionId: z.number(),
    change: z.number()
}))

export type VoteDiffs = z.infer<typeof voteDiffSchema>;

const Voting: React.FC<VotingProps> = ({options, credits, updateCredits}) => {
    const fetcher = useFetcher()
    const [optionData, setOptions] = useImmer(options)
    const [error, setError] = useState('')

    const diffData: VoteDiffs = useMemo(() => {
        const data: VoteDiffs = []

        options.forEach((option, index) => {
            if (option.myVotes !== optionData[index].myVotes) {
                data.push({change: optionData[index].myVotes - option.myVotes, optionId: option.id})
            }
        })

        return data
    }, [optionData, options])

    const submitVote = async () => {
        if (diffData.length > 0) {
            const formData = new FormData()
            formData.set('data', JSON.stringify({options: diffData, credits}))
            fetcher.submit(formData, {
                action: '/vote?index',
                method: 'post'
            })
        }
    }

    const increaseVote = (optionIndex: number) => (e: React.MouseEvent) => {
        setError('')
        const requiredCredits = (optionData[optionIndex].myVotes + 1) ** 2

        if (credits < requiredCredits) {
            return setError("You don't have enough credits.")
        }

        updateCredits(credits - requiredCredits)
        setOptions(draft => {
            draft[optionIndex].myVotes++
            return draft
        })
    }

    const decreaseVote = (optionIndex: number) => (e: React.MouseEvent) => {
        setError('')
        const currentVotes = optionData[optionIndex].myVotes

        if (currentVotes < 1) {
            return
        }

        const creditsToRedeem = currentVotes ** 2

        updateCredits(credits + creditsToRedeem)
        setOptions(draft => {
            draft[optionIndex].myVotes--
            return draft
        })

    }

    return (
        <>
            <div className="w-full p-4 mt-4 bg-red-300" hidden={!fetcher?.data && !error}>
                <h2 className="text-lg">{fetcher?.data || error}</h2>
            </div>
            <ul>
                {optionData.map((option, index) => {
                    return (
                        <li className="flex flex-col my-8" key={option.id}>
                            <h4 className="text-2xl">{option.text}</h4>
                            <div className="flex items-center justify-between mt-4 space-x-4">
                                <button
                                    onClick={decreaseVote(index)}
                                    disabled={option.myVotes === 0}
                                    className="relative w-8 h-8 p-0 btn bg-accent3"
                                >
                                  <span
                                      className="absolute text-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    -
                                  </span>
                                </button>
                                <h4 className="my-0 text-xl">
                                    Current Votes: <span className="text-secondary">{option.myVotes}</span>
                                </h4>
                                <button
                                    onClick={increaseVote(index)}
                                    className="relative w-8 h-8 p-0 btn bg-accent3"
                                    disabled={credits < (option.myVotes + 1) ** 2}
                                >
                                  <span
                                      className="absolute text-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    +
                                  </span>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <button className="btn bg-primary w-full text-white" onClick={submitVote}
                    disabled={diffData.length === 0 || fetcher.state !== "idle"}>
                {fetcher.state === 'submitting' ? "Submitting..." : "Submit Votes"}
            </button>
        </>
    );
};

export default Voting;
