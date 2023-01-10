import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = ({ request }: LoaderArgs) => {
    return redirect(request.url.replace('poll', 'polls'))
}