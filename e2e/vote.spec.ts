import test from "@playwright/test";

test.describe('voting', () => {
    test('should show graph if there are any votes', async ({browser}) => {})
    test('should show no votes text if there is no votes yet', async ({browser}) => {})
    test('should disable downvote if vote is 0', async ({browser}) => {})
    test('should disable upvote if credits not enough', async ({browser}) => {})
    test('should disable voting when submitting', async ({browser}) => {})
    test('should refresh state after voting', async ({browser}) => {})
})