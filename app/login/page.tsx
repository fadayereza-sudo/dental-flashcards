type SearchParams = Promise<{ from?: string; error?: string }>;

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { from = "/", error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#f7f2e8]">
      <form
        action="/api/auth/login"
        method="POST"
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold text-stone-900">Sign in</h1>
        <p className="text-sm text-stone-600">
          Enter the study password to continue.
        </p>
        <input type="hidden" name="from" value={from} />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          autoFocus
          className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900"
          placeholder="Password"
        />
        {error ? (
          <p className="text-sm text-red-600">Incorrect password.</p>
        ) : null}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
