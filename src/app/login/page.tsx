"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    // TODO: remplacer par appel API auth réel
    setError("");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="hidden flex-1 md:block md:relative">
          <Image
            src="/assets/landing-i4.jpg"
            alt="Welcome illustration"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-linear-to-br from-black/35 to-black/15" />
          <div className="absolute left-8 top-8 text-white">
            <p className="text-lg font-semibold">Find your sweet home</p>
            <p className="mt-2 text-sm text-white/80">
              Schedule visit in just a few clicks
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-8 p-8 md:w-1/2 md:p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-black" />
              <span className="text-2xl font-black tracking-tight">DAHOO</span>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Back to home
            </Link>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome Back to DAHOO!
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800"
          >
            {error ? (
              <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <label className="block text-sm font-medium">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@dahoo.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 dark:border-slate-700 dark:bg-slate-900"
            />

            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 dark:border-slate-700 dark:bg-slate-900"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don’t have an account?{" "}
            <Link
              href="/"
              className="font-medium text-slate-900 underline dark:text-slate-100"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
