import { Alert, AlertDescription, Icon, AlertTitle, Box, Text } from "@chakra-ui/react";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import type { loader } from "~/routes/poll/$pollId";
import { useToast } from '@chakra-ui/react'

const PollShare = () => {
  const toast = useToast()
  const { currentUrl, poll } = useLoaderData<typeof loader>();
  const url = `${currentUrl}/join?pollId=${poll.id}`

  const onClick = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied URL to clipboard!",
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  };

  return (
    <Alert
      my={6}
      w="xl"
      cursor="pointer"
      _hover={{
        backgroundColor: "blue.200"
      }}
      onClick={onClick}
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
  );
};

export default PollShare;
