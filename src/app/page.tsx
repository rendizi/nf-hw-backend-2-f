import Image from "next/image";

export default function Home() {
  return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">To start you need to signup/signin</p>
              <a href="/auth">
            <button className="btn btn-primary">Get Started</button>
              </a>
          </div>
        </div>
      </div>
  );
}
