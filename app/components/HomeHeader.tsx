import { useLoaderData } from "@remix-run/react";
import React from "react";
import type { HomeLoaderData } from "~/routes";
import {Text} from "@chakra-ui/react";

const HomeHeader = () => {
  const { username } = useLoaderData<HomeLoaderData>();
  return (
    <div>
      <Text fontSize="2xl">
        Welcome <span>{username}</span> to Quadratic
        Voting!
      </Text>
      <p>
        This is a simple website that provides a simple way to create quadratic
        polls.
      </p>
    </div>
  );
};

export default HomeHeader;
