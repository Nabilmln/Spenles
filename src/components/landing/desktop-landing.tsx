import Image from "next/image";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Check,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ScrollStack, ScrollStackItem } from "./feature-scroll-stack";
import { GettingStartedTabs } from "./getting-started-tabs";
import { LandingEntrance } from "./landing-entrance";
import { LandingMotion } from "./landing-motion";
import { WhySpenlesMotion } from "./why-spenles-motion";
import styles from "./desktop-landing.module.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const income = [49, 56, 53, 63, 59, 68, 64, 73, 70, 77, 74, 84];
const expenses = [27, 34, 31, 43, 39, 47, 45, 54, 49, 59, 55, 64];
const heroTitleWords = ["Your", "money,", "clearly", "in", "view."];
const sectionHeading = "m-0 text-[clamp(2.7rem,4.3vw,4.7rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-balance";
const sectionDescription = "mt-[1rem] max-w-[100ch] text-[.92rem] leading-[1.8] text-[#656660] text-pretty";
const featureLayout = "grid grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] items-center gap-16 px-[clamp(2rem,5vw,5rem)] py-14 max-[900px]:gap-6 max-[900px]:p-10 max-[720px]:grid-cols-1 max-[720px]:content-center max-[720px]:gap-6 max-[720px]:p-8";
const featureHeading = "my-[.85rem] text-[clamp(1.85rem,2.7vw,3rem)] font-semibold leading-[1.14] tracking-[-.042em] text-balance";
const featureDescription = "m-0 max-w-[42ch] text-[.86rem] leading-[1.75] text-[#62645f]";
const previewCard = "ml-auto w-[min(100%,370px)] rounded-[19px] border border-[#e6e8e9] bg-white p-[1.3rem] text-[.75rem] text-[#171717] shadow-[0_16px_38px_rgb(22_28_34_/_7%)] max-[720px]:mx-auto max-[720px]:w-[min(100%,380px)]";

function linePath(values: number[]) {
  const points = values.map((value, index) => ({
    x: 8 + (index * 584) / (values.length - 1),
    y: 150 - value * 1.38,
  }));
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const before = points[index - 2] ?? previous;
    const next = points[index + 1] ?? point;
    return `${path} C ${previous.x + (point.x - before.x) / 6} ${previous.y + (point.y - before.y) / 6}, ${point.x - (next.x - previous.x) / 6} ${point.y - (next.y - previous.y) / 6}, ${point.x} ${point.y}`;
  }, "");
}

function IllustrativeLineChart({ id }: { id: string }) {
  const expensePath = linePath(expenses);
  return (
    <svg className={styles.lineChart} viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--analytics)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--analytics)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {months.map((month, index) => (
        <line key={month} x1={8 + (index * 584) / 11} x2={8 + (index * 584) / 11} y1="8" y2="150" className={styles.lineChartGuide} />
      ))}
      <line x1="8" x2="592" y1="150" y2="150" className={styles.lineChartGuide} />
      <path d={`${expensePath} L 592 150 L 8 150 Z`} fill={`url(#${id})`} />
      <path d={linePath(income)} className={`${styles.lineChartIncome} landing-trend-line`} pathLength={1} />
      <path d={expensePath} className={`${styles.lineChartExpense} landing-trend-line`} pathLength={1} />
    </svg>
  );
}

export function DesktopLanding() {
  return (
    <div className={`${styles.landing} min-h-screen overflow-clip bg-white text-[#171717] tabular-nums scroll-smooth`} lang="en" data-landing-root>
      <LandingMotion />
      <LandingEntrance />
      <header className={`${styles.header} sticky top-0 z-50 flex min-h-20 items-center gap-8 bg-white max-[720px]:justify-between max-[720px]:gap-4`}>
        <div className="shrink-0" data-entry-logo><Brand showLabel /></div>
        <nav aria-label="Landing page" className="ml-auto flex items-center gap-[2.3rem] text-[.82rem] font-medium max-[980px]:gap-4 max-[720px]:hidden [&_a]:transition-opacity [&_a]:duration-200 [&_a:hover]:opacity-55" data-entry-nav>
          <a className="max-[980px]:hidden" href="#why-spenles">Why Spenles</a>
          <a href="#features">Features</a>
          <a href="#insights">Insights</a>
        </nav>
        <a className="inline-flex min-h-12 items-center justify-center gap-[.65rem] whitespace-nowrap rounded-full bg-[#171717] px-[1.18rem] py-[.7rem] text-[.82rem] font-semibold text-white transition-[background,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#353531] hover:shadow-[0_10px_24px_rgb(0_0_0_/_13%)]" href="#get-started" data-entry-nav>
          Try Spenles
        </a>
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
            className="relative mx-auto grid min-h-[calc(100svh-80px)] w-[min(calc(100%-7rem),1340px)] grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] items-center gap-[clamp(3rem,6vw,7rem)] py-8 max-[1220px]:w-[min(calc(100%-4rem),1120px)] max-[980px]:w-[calc(100%-3rem)] max-[980px]:min-h-0 max-[980px]:grid-cols-1 max-[980px]:gap-12 max-[980px]:py-24"
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
              <div className="relative aspect-[3.2] w-full overflow-hidden rounded-[22px] bg-[#e4e7e8]" data-why-photo>
                <Image
                  src="/illustrations/why-spenles-receipt.webp"
                  alt="An everyday receipt beside a wallet on a table"
                  fill
                  sizes="(max-width: 980px) 95vw, 52vw"
                  className="object-cover"
                />
              </div>
              <p className="ml-auto max-w-[68%] text-[.82rem] leading-[1.55] text-[#4f5455]" data-why-copy>
                Keep the amount, account, category, and date together in one record.
              </p>
              <div className="relative ml-auto aspect-[3.2] w-2/3 overflow-hidden rounded-[20px] bg-[#e4e7e8]" data-why-photo>
                <Image
                  src="/illustrations/why-spenles-notes.webp"
                  alt="Someone recording everyday spending in a phone note"
                  fill
                  sizes="(max-width: 980px) 63vw, 35vw"
                  className="object-cover"
                />
              </div>
              <p className="mr-auto max-w-[68%] text-[.82rem] leading-[1.55] text-[#4f5455]" data-why-copy>
                Find a payment later by date, account, or category.
              </p>
              <div className="relative mr-auto aspect-[3.2] w-1/2 overflow-hidden rounded-[18px] bg-[#e4e7e8]" data-why-photo>
                <Image
                  src="/illustrations/why-spenles-calculator.webp"
                  alt="Someone calculating expenses with a physical calculator"
                  fill
                  sizes="(max-width: 980px) 48vw, 26vw"
                  className="object-cover"
                />
              </div>
              <p className="ml-auto max-w-[68%] text-[.82rem] leading-[1.55] text-[#4f5455]" data-why-copy>
                See spending beside income and the budgets you set.
              </p>
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
            <ScrollStackItem className={`${featureLayout} max-[720px]:content-start`}>
              <div className={`${styles.featureCopy} max-[900px]:max-w-72`}>
                <h3 className={`${featureHeading} max-w-[50ch]`} data-reveal="left">Settle the table, down to the last rupiah.</h3>
                <p className={featureDescription} data-reveal="left" data-delay="70">
                  Assign items to people, include tax and service, and get
                  shares that add up to the final bill.
                </p>
              </div>
              <figure className={styles.splitPhone} data-reveal="fade">
                <Image
                  src="/illustrations/split-bill-phone.png"
                  alt="Spenles Split Bill Result on a phone, showing each person's share of a burger bill"
                  width={1024}
                  height={1536}
                  sizes="(max-width: 720px) 338px, 400px"
                  priority={false}
                />
              </figure>
            </ScrollStackItem>
            <ScrollStackItem className={featureLayout}>
              <div className={styles.featureCopy}>
                <h3 className={`${featureHeading} max-w-[14ch]`} data-reveal="up">Give your spending a plan.</h3>
                <p className={featureDescription} data-reveal="up" data-delay="70">
                  Set limits by category and see what remains as the month moves
                  on.
                </p>
              </div>
              <div
                className={previewCard}
                aria-label="Budget preview"
                data-reveal="up"
              >
                <div className="mb-4 grid gap-1">
                  <span>Food & drinks</span>
                  <strong className="text-[1.06rem]">Rp 340,000 left</strong>
                </div>
                <span className={styles.budgetDemoTrack} role="progressbar" aria-label="Food and drinks budget used" aria-valuenow={57.5} aria-valuemin={0} aria-valuemax={100}>
                  <i />
                </span>
                <small className="mt-3 block text-[.67rem] text-[#747775]">Rp 460,000 of Rp 800,000 used</small>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={featureLayout}>
              <div className={styles.featureCopy}>
                <h3 className={`${featureHeading} max-w-[14ch]`} data-reveal="up">See the story behind the numbers.</h3>
                <p className={featureDescription} data-reveal="up" data-delay="70">
                  See what came in, what went out, and where you spent.
                  Revisit your report whenever you need it.
                </p>
              </div>
              <div
                className={previewCard}
                aria-label="Report preview"
                data-reveal="up"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Money in and out</span>
                  <ChartNoAxesCombined size={17} />
                </div>
                <div className="mt-[.7rem] h-[92px]">
                  <IllustrativeLineChart id="feature-report-fill" />
                </div>
                <span className="mt-[.4rem] flex justify-between text-[.65rem] text-[#868985]">
                  Jan <b className="font-normal">Jun</b> Dec
                </span>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={featureLayout}>
              <div className={styles.featureCopy}>
                <h3 className={`${featureHeading} max-w-[13ch]`} data-reveal="left">And many more features.</h3>
                <p className={featureDescription} data-reveal="left" data-delay="70">
                  The everyday details have a place too, from your accounts to
                  the records you want to keep.
                </p>
              </div>
              <ul className="ml-auto grid w-[min(100%,430px)] list-none gap-[.65rem] p-0 max-[720px]:mx-auto max-[720px]:w-[min(100%,380px)] [&_li]:rounded-[15px] [&_li]:border [&_li]:border-[#e1e4e5] [&_li]:bg-[#f5f6f7] [&_li]:px-[1.2rem] [&_li]:py-4 [&_li]:text-[.84rem] [&_li]:font-medium" aria-label="More Spenles features">
                <li data-reveal="right">Income & expense tracking</li>
                <li data-reveal="right" data-delay="50">Accounts & transfers</li>
                <li data-reveal="right" data-delay="100">Custom categories</li>
                <li data-reveal="right" data-delay="150">Save a copy of your records</li>
              </ul>
            </ScrollStackItem>
          </ScrollStack>
        </section>
        <section
          aria-labelledby="insights-title"
          className={styles.insights}
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
            src="/illustrations/report-phone-right-hand.png"
            alt="Spenles Reports screen on a phone held in a right hand"
            width={1024}
            height={1536}
            sizes="(max-width: 980px) 90vw, 600px"
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
      <footer className="w-full rounded-t-[38px] bg-[#171717] text-white [&_a:focus-visible]:outline-white">
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
