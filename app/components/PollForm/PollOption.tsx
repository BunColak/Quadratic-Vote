import { MinusIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { useTransition } from "@remix-run/react";
import React from "react";
import { TextField } from "./TextField";

type PollOptionProps = {
    error?: string;
    id: string | number;
    defaultValue: string;
    index: number;
    deleteQuestion?: () => void;
};

const PollOption: React.FC<PollOptionProps> = ({
    defaultValue,
    index,
    error,
    id,
    deleteQuestion,
}) => {
    const transition = useTransition();
    return (
        <Flex alignItems='center'>
            {id ? (
                <input hidden name={`options[${index}][id]`} defaultValue={id} />
            ) : null}
            <TextField
                name={`options[${index}][text]`}
                label={`Option ${index + 1}`}
                error={error}
                defaultValue={defaultValue}
            />
            {deleteQuestion && <IconButton
                top="6"
                ml={4}
                onClick={deleteQuestion}
                disabled={transition.state == "loading"}
                aria-label="Remove Question"
                icon={<MinusIcon />}
                variant="ghost"
                colorScheme="red"
            />}
        </Flex>
    );
};

export default PollOption;
