
import { AddIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { Link, useLoaderData } from "@remix-run/react";
import type { HomeLoaderData } from "~/routes";

const HomeHeader = () => {
    const { username } = useLoaderData<HomeLoaderData>();
    return (
        <Box as='section'>
            <Center pt={['12','48']}>
                <Container maxW="container.md">
                    <Heading fontSize="6xl" textAlign="center">
                        Welcome <Text as='span' color="blue.500">{username}</Text> to <Text as='span' color='teal.500'>Quadratic
                            Voting!</Text>
                    </Heading>
                    <Text mt='5' textAlign='center' fontSize="xl" color="gray.500">
                        This is a simple website that provides a simple way to create quadratic
                        polls.
                    </Text>
                    <Center>
                        <SimpleGrid mt='5' spacing={[5,10]} columns={[1,2]}>
                            {username ?
                                <>
                                    <Button as={Link} to="/polls" size="lg" colorScheme="teal" rightIcon={<ArrowForwardIcon />}>Go to existing pools</Button>
                                    <Button as={Link} to="/create" size='lg' colorScheme="blue" rightIcon={<AddIcon />}>Create New Poll</Button>
                                </>
                                :
                                <>
                                    <Button size='lg' colorScheme="blue">What is a "Quadratic Poll?"</Button>
                                    <Button size="lg" colorScheme="teal">Log In</Button>
                                </>
                            }
                        </SimpleGrid>
                    </Center>
                </Container>
            </Center>
        </Box>
    )
        ;
};

export default HomeHeader;
