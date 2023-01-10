import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/prisma.server";

/**
 * Deprecated route, redirect to new one
 */
export const loader = async ({ params }: LoaderArgs) => {
  const { voterId } = params;

  const voter = await db.voter.findFirst({
    where: { id: voterId },
    include: { votes: true, poll: true },
  });

  if (!voter) {
    throw new Response("Voter not found", { status: 404 });
  }

  return redirect(`/poll/${voter.pollId}/vote/${voterId}`, { status: 301 })
};