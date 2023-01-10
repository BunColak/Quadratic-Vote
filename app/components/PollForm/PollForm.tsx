import { AddIcon } from "@chakra-ui/icons";
import { Button, Divider, Flex, Heading, Spacer } from "@chakra-ui/react";
import { Form, useActionData, useTransition } from "@remix-run/react";
import React, { useState } from "react";
import { z } from "zod";
import type { action as createAction } from "~/routes/create";
import type { PollEditLoaderData } from "~/routes/polls/$pollId/edit";
import PollOption from "./PollOption";
import { TextField } from "./TextField";

type PollFormProps = {
  poll?: PollEditLoaderData["poll"];
  isLoggedIn?: boolean;
};

export const pollFormSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  initialCredits: z.preprocess(
    (val) => Number(val),
    z.number().min(0).int("Initial Credits should be an integer")
  ),
  options: z
    .array(
      z.object({
        id: z
          .preprocess((val) => Number(val), z.number().nullable().optional())
          .optional(),
        text: z.string().min(2),
      })
    )
    .min(2),
});

export const PollForm: React.FC<PollFormProps> = ({
  poll,
  isLoggedIn = false,
}) => {
  const transition = useTransition();
  const actionData = useActionData<typeof createAction>();
  const [questionCount, setQuestionCount] = useState(poll?.options.length || 2);

  const addQuestion = () => setQuestionCount((r) => r + 1);

  const removeQuestion = () => setQuestionCount((r) => r - 1);

  return (
    <Form method="post" action={poll ? `/polls/${poll.id}/edit` : "/create"}>
      <div>
        <Heading>
          {poll ? `Editing poll ${poll.title}` : "Create a New Poll"}
        </Heading>
        {/* <div hidden={!actionData?.errors?.formErrors.length}>
          <h2>{actionData?.errors?.formErrors.join(',')}</h2>
        </div> */}
        <TextField
          name="title"
          label="Title"
          error={actionData?.errors?.fieldErrors.title?.join(",")}
          attr={{ required: true }}
          defaultValue={poll?.title}
        />
        <TextField
          name="description"
          multiline
          label="Description"
          helperText="Give a desriptive text to your poll"
          error={actionData?.errors?.fieldErrors.description?.join(",")}
          defaultValue={poll?.description}
        />
        <TextField
          name="initialCredits"
          label="Initial Credits"
          type="number"
          error={actionData?.errors?.fieldErrors.initialCredits?.join(",")}
          defaultValue={poll?.initialCredits || 100}
          helperText="How many credits each participant should have initially?"
        />
        <Divider my={8} />
        <Heading fontSize="2xl">Options</Heading>
        {[...Array(questionCount)].map((_, i) => (
          <div key={i}>
            <PollOption
              defaultValue={poll?.options[i] ? poll?.options[i]?.text : ""}
              id={poll?.options[i] ? poll?.options[i].id : ""}
              index={i}
              error={actionData?.errors?.fieldErrors.options?.join(",")}
              deleteQuestion={
                i === questionCount - 1 ? removeQuestion : undefined
              }
            />
          </div>
        ))}
        <Flex mt={4} justifyContent="end">
          <Button type="submit" colorScheme="blue" disabled={transition.state == "loading"}>
            {poll ? "Edit" : "Create"} Poll
          </Button>
          <Spacer />
          <Button
            onClick={addQuestion}
            disabled={transition.state == "loading"}
            aria-label="Add Question"
            rightIcon={<AddIcon />}
            colorScheme="teal"
          >Add Option</Button>
        </Flex>

      </div>
    </Form>
  );
};
