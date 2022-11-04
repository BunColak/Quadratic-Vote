import { useLoaderData } from "@remix-run/react";
import React from "react";
import type { loader } from "~/routes/poll/$pollId";

const Voters = () => {
  const { voters } = useLoaderData<typeof loader>();

  return (
    <div className="p-10 mt-8 rounded bg-secondary3">
      <table className="w-full">
        <thead>
          <tr>
            <th>
              <h3 className="mt-0 underline">Voters</h3>
            </th>
            <th align="center">
              <h3 className="mt-0 underline">Credits remaining</h3>
            </th>
          </tr>
        </thead>
        <tbody>
          {voters.map((voter) => {
            return (
              <tr key={voter.id}>
                <td>
                    <h3>{voter.name}</h3>
                </td>
                <td align="center">
                    <p className="text-lg">{voter.credits}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Voters;
