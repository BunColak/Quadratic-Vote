import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { Await, useLoaderData } from "@remix-run/react";
import React, { Suspense } from "react";
import type { loader } from "~/routes/polls/$pollId";

const Voters = () => {
  const { data } = useLoaderData<typeof loader>();

  return (
    <Box mt={6}>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>
              <h3>Voters</h3>
            </Th>
            <Th align="center">
              <h3>Credits remaining</h3>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={data}>
              {({ voters }) => voters.map((voter) => {
                return (
                  <Tr key={voter.id}>
                    <Td>
                      <h3>{voter.name}</h3>
                    </Td>
                    <Td align="center">
                      <p>{voter.credits}</p>
                    </Td>
                  </Tr>
                );
              })}
            </Await>
          </Suspense>
        </Tbody>
      </Table>
    </Box>
  );
};

export default Voters;
