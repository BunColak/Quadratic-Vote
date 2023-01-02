import { useLoaderData } from "@remix-run/react";
import React from "react";
import type { HomeLoaderData } from "~/routes";
import PollItem from "./PollItem";

const ExistingPolls = () => {
  const { polls, username } = useLoaderData<HomeLoaderData>();

  return (
    <div>
      {username ? (
        <div className="flex flex-col space-y-4 max-h-[50vh] overflow-auto hidden-scroll" data-testid='existing-polls'>
          {polls.map((poll) => (
            <PollItem key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="p-6 rounded bg-secondary3 text-primary">
          <h3 className="text-lg" data-testid='login-warning'>Login To See Existing Polls</h3>
        </div>
      )}
    </div>
  );
};

export default ExistingPolls;
