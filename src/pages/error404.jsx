import React from 'react'
import Layout from '../layout/Layout'

const Error404 = () => {
  return (
    <Layout>
      <main className="min-h-[70vh] flex items-center justify-center px-4 pt-24 pb-24">
        <div className="container mx-auto flex flex-col items-center text-center gap-6">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-dark/60">
            Error 404
          </p>
          <h1 className="text-3xl lg:text-5xl font-bold uppercase text-dark">
            Page not found
          </h1>
          <p className="max-w-xl text-dark/70 text-sm lg:text-base">
            The page you are looking for may have been moved, deleted, or never existed.
            Please double‑check the URL or continue browsing our collections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-black text-white px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary transition-all"
            >
              Back to home
            </a>
            <a
              href="/product-category/tiles"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-secondary text-dark px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all"
            >
              Browse all products
            </a>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Error404