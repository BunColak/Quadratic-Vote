import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
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
import { Link, NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react";
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
  const matches = useMatches()
  const isRootPolls = matches[matches.length - 1].id === 'routes/polls/index'  

  return (
    <Container maxW={['container.md', 'container.lg', 'container.xl']} pt={10} pb={20}>
      <Grid templateColumns="repeat(5, 1fr)" gap={8}>
        <GridItem colSpan={{base: isRootPolls ? 5 : 1, lg: 1}} display={{ base: isRootPolls ? 'block' : 'none', lg: 'block' }}>
          <Heading fontSize="2xl">Existing Polls</Heading>
          <VStack align="start" mt={8} spacing={6} maxH="2xl" overflow="auto">
            {data.polls.map((poll) => (
              <LinkBox
                _hover={{
                  backgroundColor: "gray.100"
                }}
                sx={{
                  "&.active": {
                    backgroundColor: "gray.100"
                  }
                }}
                w="full"
                p={4}
                rounded="md"
                as={NavLink}
                to={`/polls/${poll.id}/`}
                key={poll.id}
              >
                <LinkOverlay>{poll.title}</LinkOverlay>
                <Text color="gray.400" fontSize="sm">
                  {poll.description || "No description"}
                </Text>
              </LinkBox>
            ))}
            <Button as={Link} to='/create' colorScheme='blue' rightIcon={<AddIcon />} w='full'>New Poll</Button>
          </VStack>
        </GridItem>
        <GridItem colSpan={{ base: 5, lg: 4 }} w='full' display={{ base: isRootPolls ? 'none' : 'block', lg: 'block' }}>
          <Outlet />
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Polls;
