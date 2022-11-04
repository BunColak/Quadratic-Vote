import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import React, { useEffect } from "react";
import type { RootLoaderData } from "~/root";

const Navbar = () => {
  const data = useLoaderData<RootLoaderData>();
  const location = useLocation();
  const fetcher = useFetcher()

  useEffect(() => {
    const handleCallback = (response: any) => {
      fetcher.submit(response, { action: '/auth/callback', method: 'post' })
    }

    const google = (window as any).google
    google.accounts.id.initialize({
      client_id: data.clientId,
      callback: handleCallback
    });
    google.accounts.id.renderButton(
      document.getElementById("googleDiv"),
      { theme: "outline", size: "large" }  // customization attributes
    );
  }, [data.clientId, fetcher])

  return (
    <div
      className={`p-4 relative z-10 ${location.pathname !== "/" ? "bg-primary" : ""
        }`}
    >
      <div className="container flex flex-wrap items-center justify-center mx-auto lg:justify-start">
        <div className="flex-grow">
          <Link to="/" className="flex py-2 text-3xl space-x-2">
            <img src="/qv_logo.png" alt="Quadratic Vote" className="h-10" />
            <span className="relative hidden text-secondary3 md:inline">Quadratic Vote</span>
          </Link>
        </div>
        <div className="flex items-center flex-grow-0 md:space-x-4 space-x-2 md:mt-0">
          <div id="googleDiv" hidden={data.isLoggedIn}></div>
          {data.isLoggedIn && (
            <Link to="/auth/logout" className="btn bg-secondary3">
              Logout
            </Link>
          )}
          {location.pathname === "/" ? (
            <Link to="/create" className="btn bg-accent3 whitespace-nowrap">
              Create New Poll
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
