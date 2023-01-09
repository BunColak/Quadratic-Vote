import { AddIcon } from "@chakra-ui/icons";
import { Box, Link, Img, Heading, Container, Flex, Spacer, Button, HStack } from "@chakra-ui/react";
import { Link as RemixLink, useFetcher, useLoaderData } from "@remix-run/react";
import React, { useEffect } from "react";
import type { RootLoaderData } from "~/root";

const Navbar = () => {
  const data = useLoaderData<RootLoaderData>();
  const fetcher = useFetcher()

  useEffect(() => {
    const handleCallback = (response: any) => {
      fetcher.submit(response, { action: '/auth/callback', method: 'post' })
    }

    const google = (window as any).google
    google?.accounts.id.initialize({
      client_id: data.clientId,
      callback: handleCallback
    });
    google?.accounts.id.renderButton(
      document.getElementById("googleDiv"),
      { theme: "outline", size: "large" }  // customization attributes
    );
  }, [data.clientId, fetcher])

  return (
    <Box as='nav' w='full' h="16" display="flex" alignItems="center">
      <Container minW="container.xl">
        <Flex >
          <Link as={RemixLink} to="/" display="flex" alignItems="center">
            <Img display="inline" src="/qv_logo.png" alt="Quadratic Vote" h="8" />
            <Heading fontSize="2xl" ml='2'>Quadratic Vote</Heading>
          </Link>
          <Spacer />
          <HStack spacing="6">
            <div id="googleDiv" hidden={data.isLoggedIn}></div>
            {data.isLoggedIn && (
              <Button as={RemixLink} to="/auth/logout" variant="link" colorScheme="red">
                Logout
              </Button>
            )}
            {data.isLoggedIn ? (
              <Button as={RemixLink} to="/create" colorScheme="blue" rightIcon={<AddIcon fontSize="xs" />} variant='solid'>
                New Poll
              </Button>
            ) : <Button as={RemixLink} to="/auth/login">Login to Create Polls</Button>}
          </HStack>
        </Flex>
        {/* <div>
        <div>
          
        </div>
        <div>
          <div id="googleDiv" hidden={data.isLoggedIn}></div>
          {data.isLoggedIn && (
            <Link to="/auth/logout" >
              Logout
            </Link>
          )}
          {data.isLoggedIn ? (
            <Link to="/create" >
              Create New Poll
            </Link>
          ) : <Link to='/' >Login to Create Polls</Link>}
        </div>
      </div> */}
      </Container>

    </Box>
  );
};

export default Navbar;
