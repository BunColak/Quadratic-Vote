import { useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import type { loader } from "~/routes/poll/$pollId";

const PollShare = () => {
  const [displayState, setDisplayState] = useState(false);
  const { currentUrl, poll } = useLoaderData<typeof loader>();
  const url = `${currentUrl}/join?pollId=${poll.id}`

  const onClick = () => {
    navigator.clipboard.writeText(url);
    setDisplayState(true);
    setTimeout(() => setDisplayState(false), 2000);
  };

  return (
    <div className="flex rounded">
      <button
        onClick={onClick}
        className="relative overflow-scroll hide-scroll whitespace-nowrap rounded flex justify-between bg-accent3 hover:bg-accent2 active:bg-accent transition-colors mx-auto min-w-[20%]"
      >
        <p className="px-4 py-3 m-0 text-left">
          {url}
        </p>
        <div className="items-center hidden px-4 py-3 md:flex">
          <span className="h-full w-[1px] bg-primary mx-4"></span>
          <img src="/share.png" alt="share" className="m-0" />
        </div>
        <div
          className={`bg-secondary3 p-2 absolute -translate-x-1/2 -translate-y-1/2 md:-translate-y-0 -bottom-full left-1/2 transition-opacity rounded ${
            displayState ? "opacity-100" : "opacity-0"
          }`}
        >
          Copied To Clipboard
        </div>
      </button>
    </div>
  );
};

export default PollShare;
