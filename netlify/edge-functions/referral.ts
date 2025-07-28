import type { Config, Context } from '@netlify/edge-functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const refCode = url.searchParams.get('ref');

  if (!refCode) {
    // If no ref code, just redirect to mint page without setting a cookie
    return Response.redirect(new URL('/mint', url.origin));
  }

  // Create a response to set the cookie and then redirect
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: new URL('/mint', url.origin).toString(),
    },
  });

  // Set a cookie with the referral code
  // It will be valid for 7 days
  response.headers.set(
    'Set-Cookie',
    `hypercatz_ref=${refCode}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  );

  return response;
};

export const config: Config = {
  path: '/r', // This function will be invoked for requests to /r?ref=...
  excludedPath: [],
};