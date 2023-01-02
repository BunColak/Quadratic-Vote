import { Link } from '@remix-run/react';
import React from 'react'

type CenteredErrorProps = {
    text: string;
    redirectText?: string
    redirectTo?: string
}

const CenteredError: React.FC<CenteredErrorProps> = ({ text, redirectTo, redirectText }) => {
    return (
        <div className="p-8 grid place-content-center" data-testid="error-page">
            <h2 className="text-xl text-red-500">{text}</h2>
            {redirectTo ?
                <Link to={redirectTo} className="btn bg-primary text-white mt-4 text-center">{redirectText}</Link> : null}
        </div>
    )
}

export default CenteredError