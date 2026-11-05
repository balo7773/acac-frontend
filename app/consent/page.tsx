import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Consent to participate — ACAC",
  description:
    "Terms you agree to when registering for the AFIT Cowrywise Ambassadors Competition.",
};

export default function ConsentPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-12">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl border border-[#E5E7EB] p-8 md:p-10">
        <Link
          href="/register"
          className="text-sm text-[#0067f5] hover:underline mb-6 inline-block"
        >
          ← Back to registration
        </Link>

        <h1 className="text-3xl font-bold text-[#082552] mb-2">
          Consent to participate
        </h1>
        <p className="text-sm text-[#6B7280] mb-8">
          Last updated: November 2026
        </p>

        <div className="prose prose-sm max-w-none text-[#082552] space-y-5 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-2">1. What this page is</h2>
            <p className="text-[#082552]">
              By registering for the AFIT Cowrywise Ambassadors Competition
              (&ldquo;ACAC&rdquo;), you agree to the terms described on this page. This is a
              university-affiliated skills competition organized by AFIT Cowrywise Ambassadors.
            Your participation is voluntary.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. AI-assisted marking</h2>
            <p className="text-[#082552]">
              Your essay and defense answer will be analyzed by two independent
              third-party artificial intelligence models: <strong>DeepSeek v4-pro</strong>{" "}
              and <strong>Gemma 4 (26B MoE)</strong>. These models produce
              independent, per-criterion evaluations — including descriptions,
              reasoning, and verbatim quotes from your essay. Their output is{" "}
              <strong>one input</strong> to the human judges&apos; decision, not a
              final score. No automated system alone determines your outcome.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. Human judges</h2>
            <p className="text-[#082552]">
              Human judges read and score your essay and defense answer. During
              the competition they are identified only by mask (Judge 1–4).
              Their real names and faces are revealed only after the competition
              has completed. Judges never see your name or matric number during
              scoring — only your participant number.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Identity &amp; admin access</h2>
            <p className="text-[#082552]">
              Competition administrators (not judges) can see your full
              registration details for identity verification, fraud prevention,
              and audit purposes. Every such access is logged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Public disclosure</h2>
            <p className="text-[#082552]">
              After the competition completes, your essay and defense answer may
              be <strong>published publicly in anonymized form</strong> — with only
              your participant number, never your name, matric number, phone
              number, or LinkedIn. Finalists&apos; names, photos, and submission
              content may be published alongside their award.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Data retention</h2>
            <p className="text-[#082552]">
              Your submitted work, scores, and audit records are retained
              indefinitely for archival and portfolio purposes. If you withdraw
              from the competition before final submission, your draft data is
              deleted at the end of the competition cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. No withdrawal after submission</h2>
            <p className="text-[#082552]">
              Once you submit your final essay, you cannot withdraw it from
              scoring or from the post-competition public archive. You may stop
              participating at any stage, but previously submitted work remains
              subject to the terms above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Eligibility &amp; fair play</h2>
            <p className="text-[#082552]">
              Your essay and defense answers must represent your own original work and critical thinking.
              While you are permitted to use AI tools as an aid for research,
              data collection, and brainstorming, the final submission must be fully drafted and meticulously polished by you.
              Submissions must be completely free of AI-generated prose,
              awkward formatting (such as unnatural hyphenations), or generic AI phrasing.
              You are entirely responsible for editing, verifying, and owning your content. 
              Please note that submissions containing any candidate identity inside the essay will be automatically disqualified.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              By ticking the consent checkbox on the registration page, you
              confirm that you have read and understood these terms and agree to
              be bound by them.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block bg-[#0067f5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0055cc]"
            >
              ← Return to registration
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
