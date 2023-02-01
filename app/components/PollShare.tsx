import { Alert, AlertDescription, Icon, AlertTitle, Box, Text } from "@chakra-ui/react";
import { Await, useLoaderData } from "@remix-run/react";
import React, { Suspense } from "react";
import type { loader } from "~/routes/polls/$pollId";
import { useToast } from '@chakra-ui/react'

const PollShare = () => {
  const toast = useToast()
  const { currentUrl, data } = useLoaderData<typeof loader>();

  const onClick = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied URL to clipboard!",
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  };

  return (
    <Suspense>
      <Await resolve={data}>
        {({ poll }) => {
          const url = `${currentUrl}/join?pollId=${poll.id}`

          return <Alert
            my={6}
            w={['full', '50%']}
            cursor="pointer"
            _hover={{
              backgroundColor: "blue.200"
            }}
            onClick={() => onClick(url)}
            rounded='md'
          >
            <Icon as={() => <img src="/share.png" alt="share" />}>
            </Icon>
            <Box ml={4}>
              <AlertTitle>
                Click to copy join URL
              </AlertTitle>
              <AlertDescription>
                <Text fontSize='sm'>
                  {url}
                </Text>
              </AlertDescription>
            </Box>

          </Alert>
        }}
      </Await>
    </Suspense>
  );
};

export default PollShare;
