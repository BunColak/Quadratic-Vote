import { Form, useLoaderData, useTransition } from "@remix-run/react";
import React from "react";
import type { JoinLoaderData } from "~/routes/join";

const JoinForm = () => {
  const { username, poll } = useLoaderData<JoinLoaderData>();
  const transition = useTransition();  

  return (
    <Form className="flex flex-col space-y-4" action="/join" method="post">
      <div className="form-control">
        {!username && (
          <label className="label" htmlFor="name">
            Your Name
          </label>
        )}
        <input
          hidden={!!username}
          defaultValue={username || ""}
          className="input"
          type="text"
          name="name"
          placeholder="Name"
        />
      </div>

      <div className="form-control" hidden={!!poll}>
        {!poll && (
          <label className="label" htmlFor="pollId">
            Poll ID
          </label>
        )}
        <input
          hidden={!!poll}
          className="input"
          name="pollId"
          defaultValue={poll?.id}
          placeholder="Poll ID"
        />
      </div>

      <button
        className="mt-4 uppercase btn bg-accent2"
        type="submit"
        disabled={transition.state !== "idle"}
      >
        Join
      </button>
    </Form>
  );
};

export default JoinForm;
