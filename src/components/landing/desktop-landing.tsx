import Image from "next/image";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Check,
  LockKeyhole,
  Mail,
  ReceiptText,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ScrollStack, ScrollStackItem } from "./feature-scroll-stack";
import { GettingStartedTabs } from "./getting-started-tabs";
import { LandingEntrance } from "./landing-entrance";
import { LandingMotion } from "./landing-motion";
import { GithubLogo, LinkedinLogo } from "./social-logos";
import styles from "./desktop-landing.module.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const income = [49, 56, 53, 63, 59, 68, 64, 73, 70, 77, 74, 84];
const expenses = [27, 34, 31, 43, 39, 47, 45, 54, 49, 59, 55, 64];
const heroTitleWords = ["Your", "money,", "clearly", "in", "view."];

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
    <div className={styles.landing} lang="en" data-landing-root>
      <LandingMotion />
      <LandingEntrance />
      <header className={styles.header}>
        <div className={styles.headerBrand} data-entry-logo><Brand showLabel /></div>
        <nav aria-label="Landing page" className={styles.headerNav} data-entry-nav>
          <a href="#why-spenles">Why Spenles</a>
          <a href="#features">Features</a>
          <a href="#insights">Insights</a>
        </nav>
        <a className={styles.headerAction} href="#get-started" data-entry-nav>
          Try Spenles
        </a>
      </header>
      <main>
        <section aria-labelledby="landing-title" className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1 id="landing-title" data-reveal="up">
              {heroTitleWords.map((word, index) => (
                <span key={word}>
                  <span className={styles.heroWordMask}><span data-entry-word>{word}</span></span>
                  {index < heroTitleWords.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <p data-reveal="up" data-delay="80">
              <span className={styles.heroDescriptionText} data-entry-description>
                Spenles brings everyday spending, shared bills, budgets, and
                reports into one personal finance app for your phone.
              </span>
            </p>
            <div className={styles.heroActions} data-reveal="up" data-delay="140">
              <a className={styles.primaryAction} href="#get-started" data-entry-action>
                Try Spenles on your phone{" "}
                <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className={styles.secondaryAction} href="#features" data-entry-action>
                Explore the features
              </a>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image
              className={styles.heroPhonesImage}
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
          className={styles.why}
          id="why-spenles"
        >
          <div className={styles.whyIntro}>
            <span className={styles.sectionKicker} data-reveal="up">A clearer everyday</span>
            <h2 id="why-title" data-reveal="up">Know where you stand, at a glance.</h2>
            <p data-reveal="up">
              Keep the small details organized, so your next money decision
              feels easier to make.
            </p>
          </div>
          <div className={styles.whyList}>
            <article data-reveal="right">
              <div>
                <h3>Follow the everyday</h3>
                <p>Record income and payments, then find them by account, category, or date.</p>
              </div>
              <ReceiptText size={25} strokeWidth={1.7} aria-hidden="true" />
            </article>
            <article data-reveal="right" data-delay="60">
              <div>
                <h3>See the pattern</h3>
                <p>Compare income, spending, and budget progress in one calm view.</p>
              </div>
              <ChartNoAxesCombined size={25} strokeWidth={1.7} aria-hidden="true" />
            </article>
            <article data-reveal="right" data-delay="120">
              <div>
                <h3>Stay in control</h3>
                <p>Your accounts and records remain in your own private Spenles space.</p>
              </div>
              <LockKeyhole size={25} strokeWidth={1.7} aria-hidden="true" />
            </article>
          </div>
        </section>
        <section
          aria-labelledby="features-title"
          className={styles.features}
          id="features"
        >
          <div className={styles.sectionIntro}>
            <h2 id="features-title" data-reveal="up">The right tools, without the noise.</h2>
            <p data-reveal="up">
              Split a shared bill, set a limit, or step back to see the month.
              Each task has its own clear place.
            </p>
          </div>
          <ScrollStack>
            <ScrollStackItem className={styles.splitFeature}>
              <div className={styles.featureCopy}>
                <h3 data-reveal="left">Settle the table, down to the last rupiah.</h3>
                <p data-reveal="left" data-delay="70">
                  Assign items to people, include tax and service, and get
                  shares that add up to the final bill.
                </p>
              </div>
              <div
                className={styles.splitDemo}
                aria-label="Split bill preview"
                data-reveal="fade"
              >
                <div className={styles.splitDemoTop}>
                  <ReceiptText size={19} />
                  <span>Weekend dinner</span>
                  <strong>Rp 480,000</strong>
                </div>
                <div>
                  <span>Alex</span>
                  <strong>Rp 160,000</strong>
                </div>
                <div>
                  <span>Ben</span>
                  <strong>Rp 160,000</strong>
                </div>
                <div>
                  <span>Chris</span>
                  <strong>Rp 160,000</strong>
                </div>
                <p>
                  <Check size={14} /> Every share adds up
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={styles.budgetFeature}>
              <div className={styles.featureCopy}>
                <h3 data-reveal="up">Give your spending a plan.</h3>
                <p data-reveal="up" data-delay="70">
                  Set limits by category and see what remains as the month moves
                  on.
                </p>
              </div>
              <div
                className={styles.budgetDemo}
                aria-label="Budget preview"
                data-reveal="up"
              >
                <div>
                  <span>Food & drinks</span>
                  <strong>Rp 340,000 left</strong>
                </div>
                <span className={styles.budgetDemoTrack} role="progressbar" aria-label="Food and drinks budget used" aria-valuenow={57.5} aria-valuemin={0} aria-valuemax={100}>
                  <i />
                </span>
                <small>Rp 460,000 of Rp 800,000 used</small>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={styles.reportFeature}>
              <div className={styles.featureCopy}>
                <h3 data-reveal="up">See the story behind the numbers.</h3>
                <p data-reveal="up" data-delay="70">
                  See what came in, what went out, and where you spent.
                  Revisit your report whenever you need it.
                </p>
              </div>
              <div
                className={styles.reportDemo}
                aria-label="Report preview"
                data-reveal="up"
              >
                <div>
                  <span>Money in and out</span>
                  <ChartNoAxesCombined size={17} />
                </div>
                <div className={styles.reportDemoChart}>
                  <IllustrativeLineChart id="feature-report-fill" />
                </div>
                <span>
                  Jan <b>Jun</b> Dec
                </span>
              </div>
            </ScrollStackItem>
            <ScrollStackItem className={styles.moreFeatureCard}>
              <div className={styles.featureCopy}>
                <h3 data-reveal="left">And many more features.</h3>
                <p data-reveal="left" data-delay="70">
                  The everyday details have a place too, from your accounts to
                  the records you want to keep.
                </p>
              </div>
              <ul className={styles.moreFeatureList} aria-label="More Spenles features">
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
          <div className={styles.insightsCopy}>
            <span className={styles.insightsLabel} data-reveal="left">INSIGHTS & REPORTS</span>
            <h2 id="insights-title" data-reveal="left">Understand more than your balance.</h2>
            <p data-reveal="left">
              See how income and expenses move across the months. Find where
              money went by category and turn the details into a report you can
              revisit.
            </p>
            <ul>
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
          <figure className={styles.insightMockup} data-reveal="right">
            <Image
              src="/illustrations/report-phone-right-hand.png"
              alt="Spenles Reports screen on a phone held in a right hand"
              width={1024}
              height={1536}
              sizes="(max-width: 980px) 90vw, 430px"
            />
          </figure>
        </section>
        <section
          aria-labelledby="get-started-title"
          className={styles.getStarted}
          id="get-started"
        >
          <div className={styles.getStartedIntro}>
            <h2 id="get-started-title" data-reveal="left">Choose how to begin.</h2>
            <p data-reveal="left">
              Use Spenles on your phone, preview its phone layout on desktop,
              or set up your own copy.
            </p>
          </div>
          <GettingStartedTabs />
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerIdentity} data-reveal="left">
              <Brand showLabel />
              <p>Less complexity. More confidence.</p>
            </div>
            <div className={styles.footerContact} data-reveal="right">
              <span>Developer</span>
              <div className={styles.footerLinks} aria-label="Developer contact links">
                <a href="https://www.linkedin.com/in/mnabilmaulana/" target="_blank" rel="noopener noreferrer" aria-label="Developer on LinkedIn"><LinkedinLogo /></a>
                <a href="https://github.com/Nabilmln" target="_blank" rel="noopener noreferrer" aria-label="Developer on GitHub"><GithubLogo /></a>
                <a href="mailto:nabilmaulana212@gmail.com" aria-label="Email the developer"><Mail size={19} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
          <p className={styles.footerCopyright}>© {new Date().getFullYear()} Spenles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
