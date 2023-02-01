import type { Browser } from "@playwright/test";
import { expect } from "@playwright/test"

export const getCookies = (secondary?: boolean) => {
  return [
    {
      name: "quad-session",
      value:
        secondary ? "eyJ1c2VySWQiOiIxMTM1MjUzMDYzNTA4NzczOTA0MzMifQ%3D%3D.mi3zspqQ6LE3ctloIjilASS2Y1Xnxs5CFhDzYZ0iNoY" : "eyJ1c2VySWQiOiIxMTgzOTE1MDg3MDU0OTgzNTU5MzUifQ==.1lUTVouUhxcYTvr5dNS57wAUacKfKn3APZ0zk8XAwUU",
      domain: 'localhost',
      path: '/',
    },
  ]
}

export const goToAndCheckLogin = async (browser: Browser, goTo: string, secondaryUser?: boolean) => {
  const context = await browser.newContext();
  await context.addCookies(getCookies());

  const newPage = await context.newPage()
  await newPage.goto(goTo);

  await newPage.waitForLoadState('networkidle')
  await expect(newPage.getByTestId("login-warning")).toHaveCount(0);

  return newPage
}