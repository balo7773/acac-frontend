import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — ACAC",
  description: "Sign in to the AFIT Cowrywise Ambassadors Competition as a candidate, judge, or admin.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <LoginForm />
    </>
  );
}
