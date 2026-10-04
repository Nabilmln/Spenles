import Image from "next/image";
import {
  ArrowRight,
  Check,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ScrollStack, ScrollStackItem } from "./feature-scroll-stack";
import { GettingStartedTabs } from "./getting-started-tabs";
import { LandingEntrance } from "./landing-entrance";
import { LandingMotion } from "./landing-motion";
import { WhySpenlesMotion } from "./why-spenles-motion";
import styles from "./desktop-landing.module.css";

const heroTitleWords = ["Your", "money,", "clearly", "in", "view."];
const sectionHeading = "m-0 text-[clamp(2.7rem,4.3vw,4.7rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-balance";
const sectionDescription = "mt-[1rem] max-w-[100ch] text-[.92rem] leading-[1.8] text-[#656660] text-pretty";
const featureLayout = "grid grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] items-center gap-16 px-[clamp(2rem,5vw,5rem)] py-14 max-[900px]:gap-6 max-[900px]:p-10 max-[720px]:grid-cols-1 max-[720px]:content-center max-[720px]:gap-6 max-[720px]:p-8";
const featureHeading = "my-[.85rem] text-[clamp(1.85rem,2.7vw,3rem)] font-semibold leading-[1.14] tracking-[-.042em] text-balance";
const featureDescription = "m-0 max-w-[42ch] text-[.86rem] leading-[1.75] text-[#62645f]";

export function DesktopLanding() {
  return (
    <div className={`${styles.landing} min-h-screen overflow-clip bg-white text-[#171717] tabular-nums scroll-smooth`} lang="en" data-landing-root>
      <LandingMotion />
      <LandingEntrance />
      <header className="sticky top-0 z-50 w-full bg-white">
        <div className={`${styles.headerInner} flex min-h-20 items-center gap-8 max-[720px]:justify-between max-[720px]:gap-4`}>
          <div className="shrink-0" data-entry-logo><Brand showLabel /></div>
          <nav aria-label="Landing page" className="ml-auto flex items-center gap-[2.3rem] text-[.82rem] font-medium max-[980px]:gap-4 max-[720px]:hidden [&_a]:transition-opacity [&_a]:duration-200 [&_a:hover]:opacity-55" data-entry-nav>
            <a className="max-[980px]:hidden" href="#why-spenles">Why Spenles</a>
            <a href="#features">Features</a>
            <a href="#insights">Insights</a>
          </nav>
          <a className="inline-flex min-h-12 items-center justify-center gap-[.65rem] whitespace-nowrap rounded-full bg-[#171717] px-[1.18rem] py-[.7rem] text-[.82rem] font-semibold text-white transition-[background,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#353531] hover:shadow-[0_10px_24px_rgb(0_0_0_/_13%)]" href="#get-started" data-entry-nav>
            Try Spenles
          </a>
        </div>
      </header>
      <main>
        <section aria-labelledby="landing-title" className={`${styles.hero} pt-[5.4rem] text-center max-[980px]:pt-[4.2rem] max-[720px]:pt-14`}>
          <div className="grid justify-items-center">
            <h1 className="m-0 max-w-[18ch] text-[clamp(3.6rem,6.1vw,6.4rem)] font-semibold leading-[1.07] tracking-[-.04em] text-balance max-[980px]:text-[clamp(3.3rem,7vw,5.5rem)] max-[720px]:text-[clamp(2.7rem,7vw,3.5rem)]" id="landing-title" data-reveal="up">
              {heroTitleWords.map((word, index) => (
                <span key={word}>
                  <span className="inline-block overflow-hidden align-bottom"><span className="inline-block" data-entry-word>{word}</span></span>
                  {index < heroTitleWords.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <p className="mt-[1.4rem] max-w-[54ch] text-base leading-[1.75] text-[#62625f] text-pretty" data-reveal="up" data-delay="80">
              <span className="block" data-entry-description>
                Spenles brings everyday spending, shared bills, budgets, and
                reports into one personal finance app for your phone.
              </span>
            </p>
            <div className="mt-[2.1rem] flex flex-wrap items-center justify-center gap-x-[1.6rem] gap-y-[.9rem]" data-reveal="up" data-delay="140">
              <a className="inline-flex min-h-14 items-center justify-center gap-[.65rem] whitespace-nowrap rounded-full bg-[#171717] px-6 py-[.7rem] text-[.82rem] font-semibold text-white transition-[background,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#353531] hover:shadow-[0_10px_24px_rgb(0_0_0_/_13%)]" href="#get-started" data-entry-action>
                Try Spenles on your phone{" "}
                <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className="inline-flex min-h-14 items-center justify-center gap-[.4rem] rounded-full border border-[#171717] bg-white px-[1.4rem] py-[.7rem] text-[.82rem] font-semibold text-[#171717] transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#f3f3f1]" href="#features" data-entry-action>
                Explore the features
              </a>
            </div>
          </div>
          <div className="relative mt-14 h-[clamp(400px,44vw,545px)] overflow-hidden max-[980px]:mt-12 max-[720px]:h-[340px]">
            <Image
              className={`${styles.heroPhonesImage} mx-auto block h-auto w-[min(100%,1080px)]`}
              src="/illustrations/landing-phones-v2.png"
              alt="Spenles transactions, home, and split bill screens on three phones"
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 1220px) 100vw, 1200px"
              data-reveal="up"
            />
          </div>
        </section>
        <section
          aria-labelledby="why-title"
          className="relative w-full bg-white"
          id="why-spenles"
          data-why-section
        >
          <WhySpenlesMotion />
          <div
            className="relative mx-auto grid min-h-[calc(100svh-80px)] w-[min(calc(100%-7rem),1340px)] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-[clamp(2rem,4vw,4.5rem)] py-8 max-[1220px]:w-[min(calc(100%-4rem),1120px)] max-[980px]:w-[calc(100%-3rem)] max-[980px]:min-h-0 max-[980px]:grid-cols-1 max-[980px]:gap-12 max-[980px]:py-24"
            data-why-stage
          >
            <div className="max-w-[600px]" data-why-statement>
              <h2 className={`${sectionHeading} max-w-[13ch]`} id="why-title">Know where your money went.</h2>
              <p className="mt-7 max-w-[48ch] text-[clamp(.95rem,1.25vw,1.08rem)] leading-[1.8] text-[#555a5c]">
                See what came in, what went out, and how your plans are holding up.
                The details are there when you need them.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3" data-why-detail>
              <div className="flex min-w-0 items-center gap-5">
                <div className="w-[clamp(240px,34vh,360px)] max-w-[58%] shrink-0 rounded-[22px] bg-[#171717] p-1.5 pr-5" data-why-photo>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
                    <Image
                      src="/illustrations/why-spenles-receipt.webp"
                      alt="An everyday receipt beside a wallet on a table"
                      fill
                      sizes="(max-width: 980px) 58vw, 360px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="min-w-0 max-w-[30ch] text-[.9rem] leading-[1.6] text-[#4f5455]" data-why-copy>
                  Keep the amount, account, category, and date together in one record.
                </p>
              </div>
              <div className="flex min-w-0 items-center justify-end gap-5">
                <p className="min-w-0 max-w-[29ch] text-[.9rem] leading-[1.6] text-[#4f5455]" data-why-copy>
                  Find a payment later by date, account, or category.
                </p>
                <div className="w-[clamp(160px,22.67vh,240px)] max-w-[39%] shrink-0 rounded-[20px] bg-[#171717] p-1.5 pl-5" data-why-photo>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
                    <Image
                      src="/illustrations/why-spenles-notes.webp"
                      alt="Someone recording everyday spending in a phone note"
                      fill
                      sizes="(max-width: 980px) 39vw, 240px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-5">
                <div className="w-[clamp(120px,17vh,180px)] max-w-[29%] shrink-0 rounded-[18px] bg-[#171717] p-1.5 pr-5" data-why-photo>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[12px]">
                    <Image
                      src="/illustrations/why-spenles-calculator.webp"
                      alt="Someone calculating expenses with a physical calculator"
                      fill
                      sizes="(max-width: 980px) 29vw, 180px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="min-w-0 max-w-[30ch] text-[.9rem] leading-[1.6] text-[#4f5455]" data-why-copy>
                  See spending beside income and the budgets you set.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          aria-labelledby="features-title"
          className={`${styles.features} pt-2 pb-8`}
          id="features"
        >
          <ScrollStack>
            <div className={`${styles.featureIntro} mb-9 max-w-[700px]`}>
              <h2 className={`${sectionHeading} max-w-[13ch]`} id="features-title" data-reveal="up">The right tools, without the noise.</h2>
              <p className={sectionDescription} data-reveal="up">
                Split a shared bill, set a limit, or step back to see the month. Each task has its own clear place.
              </p>
            </div>
            <ScrollStackItem className={`${featureLayout} ${styles.splitFeature} max-[720px]:content-start`}>
              <div className={`${styles.featureCopy} max-[900px]:max-w-72`}>
                <h3 className={`${featureHeading} max-w-[50ch]`} data-feature-motion="slide-left">Settle the table, down to the last rupiah.</h3>
                <p className={featureDescription} data-feature-motion="slide-left" data-motion-step="1">
                  Add a shared bill once, then see what each person owes
                  without working it out in a chat.
                </p>
              </div>
              <figure className={styles.splitPhone} data-feature-motion="rise" data-motion-step="1">
                <Image
                  src="/illustrations/split-bill-phone.png"
                  alt="Spenles Split Bill Result on a phone, showing each person's share of a burger bill"
                  width={1024}
                  height={1536}
                  sizes="(max-width: 720px) 338px, 400px"
                  priority={false}
                />
              </figure>
              <aside className={styles.splitAside} aria-label="How split bills are calculated">
                <h4 data-feature-motion="slide-right" data-motion-step="2">Every part of the bill has a place.</h4>
                <p data-feature-motion="slide-right" data-motion-step="3">Each person&apos;s result shows their items and share of the extras.</p>
                <div className={styles.splitReceipt}>
                  <div data-feature-motion="lift" data-motion-step="3"><span>Items</span><strong>Assigned</strong></div>
                  <div data-feature-motion="lift" data-motion-step="4"><span>Tax + service</span><strong>Included</strong></div>
                  <div data-feature-motion="lift" data-motion-step="5"><span>Final total</span><strong>Fully shared</strong></div>
                </div>
              </aside>
            </ScrollStackItem>
            {/* These illustrations use fixed, fictional figures and never read account data. */}
            <ScrollStackItem className={`${featureLayout} ${styles.featureVisualCard}`}>
              <div className={styles.featureCopy}>
                <h3 className={`${featureHeading} max-w-[14ch]`} data-feature-motion="lift">Know what the month can hold.</h3>
                <p className={featureDescription} data-feature-motion="fade" data-motion-step="1">
                  Set a limit for each category. A quick look tells you where
                  there is room and where to slow down.
                </p>
                <svg className={styles.budgetEnvelopes} viewBox="0 0 310 144" fill="none" aria-hidden="true" data-feature-motion="fan" data-motion-step="2">
                  <g transform="translate(64 1) rotate(9 105 55)">
                    <rect x="0.75" y="0.75" width="209.5" height="103.5" rx="14" fill="#dfe6e9" stroke="#c9d2d6" strokeWidth="1.5" />
                    <path d="M2 19 105 75 209 19" stroke="#b7c5cb" strokeWidth="1.5" />
                  </g>
                  <g transform="translate(30 17) rotate(-5 105 55)">
                    <rect x="0.75" y="0.75" width="209.5" height="103.5" rx="14" fill="#e6f3fc" stroke="#91c9ea" strokeWidth="1.5" />
                    <path d="M2 19 105 75 209 19" stroke="#91c9ea" strokeWidth="1.5" />
                  </g>
                  <g transform="translate(2 37)">
                    <rect x="0.75" y="0.75" width="209.5" height="103.5" rx="14" fill="#fff" stroke="#c8d1d6" strokeWidth="1.5" />
                    <path d="M2 19 105 75 209 19" stroke="#aab8be" strokeWidth="1.5" />
                    <circle cx="105" cy="75" r="18" fill="#168fe5" />
                    <path d="m98 75 5 5 10-11" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              <div className={styles.budgetBoard} aria-label="Illustration of monthly category budgets" data-feature-motion="slide-right" data-motion-step="1">
                <div className="flex items-start justify-between gap-3">
                  <div><span className="text-[.69rem] text-[#697074]">Monthly plan</span><strong className="mt-1 block text-[1.45rem] font-semibold tracking-[-.04em]">Three limits. One view.</strong></div>
                  <span className={styles.budgetTokens} aria-hidden="true" data-feature-motion="pop" data-motion-step="2"><i /><i /><i /></span>
                </div>
                <div className="mt-8 grid gap-5">
                  <div data-feature-motion="lift" data-motion-step="3"><div className="mb-2 flex justify-between gap-2 text-[.72rem]"><strong>Food & drinks</strong><span>Rp 244.000 / 650.000</span></div><span className={styles.budgetDemoTrack} role="progressbar" aria-label="Food and drinks budget used" aria-valuenow={37.5} aria-valuemin={0} aria-valuemax={100}><i className="!w-[37.5%]" /></span></div>
                  <div data-feature-motion="lift" data-motion-step="4"><div className="mb-2 flex justify-between gap-2 text-[.72rem]"><strong>Transport</strong><span>Rp 117.000 / 350.000</span></div><span className={styles.budgetDemoTrack} role="progressbar" aria-label="Transport budget used" aria-valuenow={33.4} aria-valuemin={0} aria-valuemax={100}><i className="!w-[33.4%]" /></span></div>
                  <div data-feature-motion="lift" data-motion-step="5"><div className="mb-2 flex justify-between gap-2 text-[.72rem]"><strong>Home</strong><span>Rp 705.000 / 900.000</span></div><span className={styles.budgetDemoTrack} role="progressbar" aria-label="Home budget used" aria-valuenow={78.3} aria-valuemin={0} aria-valuemax={100}><i className="!w-[78.3%]" /></span></div>
                </div>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={`${featureLayout} ${styles.reportVisualCard}`}>
              <div className={`${styles.featureCopy} ${styles.reportFeatureCopy}`}>
                <h3 className={`${featureHeading} max-w-[14ch]`} data-feature-motion="slide-right">See what took the biggest share.</h3>
                <p className={featureDescription} data-feature-motion="slide-right" data-motion-step="1">
                  Reports turn a long list of payments into a clear picture of
                  the categories behind them.
                </p>
                <svg className={styles.reportTrend} viewBox="0 0 370 124" fill="none" aria-hidden="true" data-feature-motion="draw" data-motion-step="3">
                  <defs>
                    <linearGradient id="feature-trend-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#168fe5" stopOpacity=".25" />
                      <stop offset="1" stopColor="#168fe5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M2 8v112m61-112v112m61-112v112m61-112v112m61-112v112m61-112v112m61-112v112" stroke="#394247" strokeWidth="1" />
                  <path d="M2 120h366" stroke="#394247" strokeWidth="1" />
                  <path d="M2 100 C28 96 38 91 63 94 S98 59 124 69 S159 77 185 55 S222 69 246 64 S280 34 307 39 S340 18 368 13 V120 H2Z" fill="url(#feature-trend-fill)" />
                  <path d="M2 100 C28 96 38 91 63 94 S98 59 124 69 S159 77 185 55 S222 69 246 64 S280 34 307 39 S340 18 368 13" stroke="#168fe5" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="368" cy="13" r="4" fill="#191c1e" stroke="#168fe5" strokeWidth="2" />
                </svg>
              </div>
              <div className={styles.reportBreakdown} aria-label="Illustration of spending by category">
                <div className="flex justify-between gap-3 text-[.7rem] text-[#b8c0c3]" data-feature-motion="fade"><span>Spending by category</span><span>Monthly view</span></div>
                <div className={styles.reportBreakdownBody}>
                  <div className={styles.reportDonut} aria-hidden="true" data-feature-motion="pop" data-motion-step="1"><div><span>Largest share</span><strong>42%</strong></div></div>
                  <div className="grid content-center gap-4 text-[.74rem]">
                    <div className="flex items-start gap-2.5" data-feature-motion="slide-right" data-motion-step="2"><i className="mt-1 size-2.5 shrink-0 rounded-[3px] bg-[#168fe5]" /><span><strong className="block font-medium">Food & drinks</strong><small className="text-[#aeb7ba]">42% of spending</small></span></div>
                    <div className="flex items-start gap-2.5" data-feature-motion="slide-right" data-motion-step="3"><i className="mt-1 size-2.5 shrink-0 rounded-[3px] bg-white" /><span><strong className="block font-medium">Home</strong><small className="text-[#aeb7ba]">33% of spending</small></span></div>
                    <div className="flex items-start gap-2.5" data-feature-motion="slide-right" data-motion-step="4"><i className="mt-1 size-2.5 shrink-0 rounded-[3px] bg-[#6d787e]" /><span><strong className="block font-medium">Everything else</strong><small className="text-[#aeb7ba]">25% of spending</small></span></div>
                  </div>
                </div>
                <p className="mt-5 border-t border-[#3c454a] pt-4 text-[.7rem] text-[#b8c0c3]" data-feature-motion="fade" data-motion-step="5">A closer look at the month, without sorting every payment yourself.</p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={`${featureLayout} ${styles.featureVisualCard} ${styles.recordsFeature}`}>
              <div className={styles.featureCopy}>
                <h3 className={`${featureHeading} max-w-[13ch]`} data-feature-motion="lift">The details stay within reach.</h3>
                <p className={featureDescription} data-feature-motion="lift" data-motion-step="1">
                  Find a past payment, move money between your accounts, and
                  organize spending your way.
                </p>
              </div>
              <div className={styles.recordBoard} aria-label="Illustration of transaction history, an account transfer, and personal categories" data-feature-motion="fade">
                <div className={styles.recordSheet} data-feature-motion="unfold" data-motion-step="1">
                  <div className="flex items-center justify-between text-[.68rem] text-[#656b6f]" data-feature-motion="fade" data-motion-step="2"><span>Transaction history</span><span>All accounts</span></div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e3e6e7] py-3 text-[.78rem]" data-feature-motion="lift" data-motion-step="3"><span><strong className="block font-semibold">Market run</strong><small className="text-[#71777b]">Food & drinks</small></span><strong className="whitespace-nowrap font-semibold">- Rp 74.000</strong></div>
                  <div className="flex items-center justify-between gap-3 border-t border-[#e3e6e7] py-3 text-[.78rem]" data-feature-motion="lift" data-motion-step="4"><span><strong className="block font-semibold">Bus fare</strong><small className="text-[#71777b]">Transport</small></span><strong className="whitespace-nowrap font-semibold">- Rp 12.000</strong></div>
                </div>
                <div className={styles.transferSlip} data-feature-motion="slide-right" data-motion-step="3">
                  <span className="text-[.68rem] text-[#bfc8cc]">Between your accounts</span>
                  <strong className="mt-1 block text-[1.18rem] tracking-[-.03em]">Rp 125.000</strong>
                  <span className="mt-1 block text-[.69rem] text-[#cbd1d4]">Cash account · Savings</span>
                </div>
                <div className={styles.categorySlip} data-feature-motion="slide-left" data-motion-step="4"><span>Your categories</span><strong>Food · Travel · Bills</strong></div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </section>
        <section
          aria-labelledby="insights-title"
          className={`${styles.insights} mt-[clamp(3rem,5vw,4.5rem)]`}
          id="insights"
        >
          <div>
            <span className="text-[.72rem] font-semibold tracking-[.06em] text-[#747570]" data-reveal="left">INSIGHTS & REPORTS</span>
            <h2 className={`${sectionHeading} mt-[1.1rem] max-w-[12ch] max-[980px]:max-w-[18ch]`} id="insights-title" data-reveal="left">Understand more than your balance.</h2>
            <p className={sectionDescription} data-reveal="left">
              See how income and expenses move across the months. Find where
              money went by category and turn the details into a report you can
              revisit.
            </p>
            <ul className="mt-8 grid list-none gap-[.9rem] p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-[.7rem] [&_li]:text-[.79rem] [&_svg]:size-[22px] [&_svg]:shrink-0 [&_svg]:rounded-full [&_svg]:bg-[#171717] [&_svg]:p-1 [&_svg]:text-white">
              <li data-reveal="left">
                <Check size={17} /> Compare income with expenses
              </li>
              <li data-reveal="left" data-delay="60">
                <Check size={17} /> See where your money went
              </li>
              <li data-reveal="left" data-delay="120">
                <Check size={17} /> Review reports by date
              </li>
            </ul>
          </div>
          <Image
            className={styles.insightMockup}
            src="/illustrations/report-phone-right-hand-wide.png"
            alt="Spenles Reports screen on a phone held in a right hand"
            width={1469}
            height={1071}
            sizes="960px"
            data-reveal="right"
          />
        </section>
        <section
          aria-labelledby="get-started-title"
          className={`${styles.getStarted} grid grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] gap-[clamp(2.5rem,7vw,8rem)] pt-24 pb-32 max-[980px]:grid-cols-1 max-[980px]:gap-12 max-[980px]:pt-20 max-[980px]:pb-24`}
          id="get-started"
        >
          <div>
            <h2 className={`${sectionHeading} max-w-[13ch]`} id="get-started-title" data-reveal="left">Choose how to begin.</h2>
            <p className={sectionDescription} data-reveal="left">
              Use Spenles on your phone, preview its phone layout on desktop,
              or set up your own copy.
            </p>
          </div>
          <GettingStartedTabs />
        </section>
      </main>
      <footer className="w-full bg-[#171717] text-white [&_a:focus-visible]:outline-white">
        <div className={`${styles.footerInner} pt-[clamp(4rem,7vw,7rem)] pb-8`}>
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] gap-16 pb-20 max-[900px]:grid-cols-1 max-[900px]:gap-14 max-[720px]:pb-14">
            <div className="[&_a]:text-white [&_img]:brightness-0 [&_img]:invert" data-reveal="left">
              <Brand showLabel />
              <p className="mt-10 max-w-[16ch] text-[clamp(2.5rem,4.5vw,4.8rem)] font-semibold leading-[1.13] tracking-[-.045em] text-balance">Less complexity.<br />More confidence.</p>
              <p className="mt-6 max-w-[43ch] text-[.9rem] leading-[1.75] text-[#b7b8b6]">A calmer place to understand your spending, plan ahead, and settle the everyday details.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-12 self-end max-[560px]:gap-x-6" data-reveal="right">
              <nav aria-label="Footer navigation" className="grid content-start gap-4 text-[.86rem] [&_a:hover]:text-white">
                <h2 className="mb-2 text-[.75rem] font-medium text-[#aeb0af]">Explore</h2>
                <a className="text-[#e6e7e6] transition-colors" href="#why-spenles">Why Spenles</a>
                <a className="text-[#e6e7e6] transition-colors" href="#features">Features</a>
                <a className="text-[#e6e7e6] transition-colors" href="#insights">Insights</a>
                <a className="text-[#e6e7e6] transition-colors" href="#get-started">Try Spenles</a>
              </nav>
              <div className="grid content-start gap-4 text-[.86rem] [&_a:hover]:text-white">
                <h2 className="mb-2 text-[.75rem] font-medium text-[#aeb0af]">Developer</h2>
                <a className="text-[#e6e7e6] transition-colors" href="https://github.com/Nabilmln" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a className="text-[#e6e7e6] transition-colors" href="https://www.linkedin.com/in/mnabilmaulana/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a className="text-[#e6e7e6] transition-colors" href="mailto:nabilmaulana212@gmail.com">Email</a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-8 border-t border-[#393c3b] py-8 max-[720px]:grid-cols-1">
            <p className="max-w-[47ch] text-[.78rem] leading-[1.75] text-[#aeb0af]"><strong className="mr-3 font-medium text-white">Privacy</strong>Each Spenles account keeps its financial records separate.</p>
            <p className="max-w-[47ch] text-[.78rem] leading-[1.75] text-[#aeb0af]"><strong className="mr-3 font-medium text-white">About the app</strong>Spenles helps you track money. It does not hold or move funds.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#393c3b] pt-6 text-xs text-[#aeb0af]">
            <span>© {new Date().getFullYear()} Spenles</span>
            <span>Made for a clearer everyday.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
