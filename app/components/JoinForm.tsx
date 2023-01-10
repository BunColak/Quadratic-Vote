import { Button } from "@chakra-ui/react";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import React from "react";
import type { loader } from "~/routes/join";

const JoinForm = () => {
  const { username, poll } = useLoaderData<typeof loader>();
  const transition = useTransition();

  return (
    <Form method='post'>
      <div>
        <input
          hidden
          defaultValue={username}
          type="text"
          name="name"
          placeholder="Name"
          required
        />
      </div>
      <div hidden>
        <input
          hidden
          name="pollId"
          defaultValue={poll.id}
          placeholder="Poll ID"
        />
      </div>
      <Button
        colorScheme='blue'
        type="submit"
        disabled={transition.state === "loading" || transition.state === 'submitting'}
      >
        Join
      </Button>
    </Form>
  );
};

export default JoinForm;
