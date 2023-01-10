import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Button, Heading, HStack, IconButton, List, ListItem, Text } from "@chakra-ui/react";
import type { Option } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React, { useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { z } from "zod";

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

const Voting: React.FC<VotingProps> = ({ options, credits, updateCredits }) => {
    const fetcher = useFetcher()
    const [optionData, setOptions] = useImmer(options)
    const [error, setError] = useState('')

    const diffData: VoteDiffs = useMemo(() => {
        const data: VoteDiffs = []

        options.forEach((option, index) => {
            if (option.myVotes !== optionData[index].myVotes) {
                data.push({ change: optionData[index].myVotes - option.myVotes, optionId: option.id })
            }
        })

        return data
    }, [optionData, options])

    const submitVote = async () => {
        if (diffData.length > 0) {
            const formData = new FormData()
            formData.set('data', JSON.stringify({ options: diffData, credits, pollId: options[0].pollId }))
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
            <div hidden={!fetcher?.data && !error}>
                <h2>{fetcher?.data || error}</h2>
            </div>
            <List>
                {optionData.map((option, index) => {
                    return (
                        <ListItem my={8} key={option.id}>
                            <Heading fontSize='md' textAlign={['center', 'left']}>{option.text}</Heading>
                            <HStack mt={2} justify={['center', 'left']}>
                                <IconButton
                                    colorScheme='red'
                                    aria-label="Decrease Vote"
                                    icon={<MinusIcon fontSize='xs' />}
                                    onClick={decreaseVote(index)}
                                    disabled={option.myVotes === 0 || fetcher.state !== "idle"}
                                />
                                <Text>
                                    {option.myVotes}
                                </Text>
                                <IconButton
                                    colorScheme='green'
                                    aria-label="Increase Vote"
                                    icon={<AddIcon fontSize='xs' />}
                                    onClick={increaseVote(index)}
                                    disabled={credits < (option.myVotes + 1) ** 2 || fetcher.state !== "idle"}
                                />
                            </HStack>
                        </ListItem>
                    );
                })}
            </List>
            <Button colorScheme='blue' w='full' onClick={submitVote}
                disabled={diffData.length === 0 || fetcher.state !== "idle"}>
                {fetcher.state === 'submitting' ? "Submitting..." : "Submit Votes"}
            </Button>
        </>
    );
};

export default Voting;
