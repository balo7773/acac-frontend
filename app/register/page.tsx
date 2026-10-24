import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register — ACAC",
  description: "Register for the AFIT Cowrywise Ambassadors Competition and compete for the Ambassador title.",
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <RegisterForm />
    </>
  );
}
