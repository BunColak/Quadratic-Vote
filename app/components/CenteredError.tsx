import { Box, Button, Center, Heading } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import React from 'react'

type CenteredErrorProps = {
    text: string;
    redirectText?: string
    redirectTo?: string
}

const CenteredError: React.FC<CenteredErrorProps> = ({ text, redirectTo, redirectText }) => {
    return (
        <Box my='20' data-testid='error-page'>
            <Heading textAlign='center'>{text}</Heading>
            <Center mt={6}>
                {redirectTo ?
                    <Button colorScheme='blue' textAlign='center' as={Link} to={redirectTo}>{redirectText}</Button> : null}
            </Center>
        </Box>
    )
}

export default CenteredError