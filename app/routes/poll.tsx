import {
  Container,
  Grid,
  GridItem,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { LoaderArgs } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import React from "react";
import { db } from "~/utils/prisma.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  const existingPolls = await db.poll.findMany({
    where: { voters: { some: { authorId: userId } } },
    orderBy: { id: "desc" },
  });

  return { polls: existingPolls };
};

const Polls = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <Container maxW="container.xl" pt={10} pb={20}>
      <Grid templateColumns="repeat(5, 1fr)" gap={8}>
        <GridItem colSpan={1}>
          <Heading fontSize="2xl">Existing Polls</Heading>
          <VStack align="start" mt={8} spacing={6} maxH="2xl" overflow="auto">
            {data.polls.map((poll) => (
              <LinkBox
                _hover={{
                  backgroundColor: "gray.100"
                }}
                sx={{"&.active": {
                  backgroundColor: "gray.100"
                }}}
                w="full"
                p={4}
                rounded="md"
                as={NavLink}
                to={`/poll/${poll.id}/`}
                key={poll.id}
              >
                <LinkOverlay>{poll.title}</LinkOverlay>
                <Text color="gray.400" fontSize="sm">
                  {poll.description || "No description"}
                </Text>
              </LinkBox>
            ))}
          </VStack>
        </GridItem>
        <GridItem colSpan={4}>
          <Outlet />
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Polls;
