import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CirclePlus,
  Coffee,
  Eye,
  Home,
  ReceiptText,
  ShoppingBag,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { CopySiteLink } from "./copy-site-link";
import styles from "./desktop-landing.module.css";

function PhoneStatus() {
  return (
    <div className={styles.phoneStatus}>
      <span>9:41</span>
      <div className={styles.phoneNotch} />
      <span className={styles.statusBars} aria-hidden="true">
        <i /> <i /> <i />
      </span>
    </div>
  );
}

function PhoneNavigation({ active }: { active: "home" | "split" }) {
  return (
    <div className={styles.phoneNavigation}>
      <span className={active === "home" ? styles.phoneNavActive : ""}>
        <Home size={17} strokeWidth={2.2} />
        {active === "home" ? "Home" : null}
      </span>
      <span><WalletCards size={17} strokeWidth={2.2} /></span>
      <span><CirclePlus size={21} strokeWidth={2.2} /></span>
      <span className={active === "split" ? styles.phoneNavActive : ""}>
        <UsersRound size={17} strokeWidth={2.2} />
        {active === "split" ? "Split" : null}
      </span>
    </div>
  );
}

function BalancePhone() {
  return (
    <div className={`${styles.phone} ${styles.balancePhone}`}>
      <PhoneStatus />
      <div className={styles.phoneBody}>
        <div className={styles.phoneHeader}>
          <span className={styles.phoneAvatar}>S</span>
          <span className={styles.phoneGreeting}>Good morning</span>
          <span className={styles.phoneHeaderIcon}><WalletCards size={17} /></span>
        </div>
        <div className={styles.balanceCard}>
          <div className={styles.balanceTop}>
            <span>Total balance</span>
            <Eye size={16} />
          </div>
          <strong>Rp 8,450,000</strong>
          <p><WalletCards size={14} /> All accounts</p>
          <div className={styles.balanceTotals}>
            <div><small>Income</small><b>Rp 12,000,000</b></div>
            <div><small>Expenses</small><b>Rp 3,550,000</b></div>
          </div>
        </div>
        <div className={styles.phoneQuickActions}>
          <div><span><ArrowDownRight size={17} /></span>Income</div>
          <div><span><ArrowUpRight size={17} /></span>Expense</div>
          <div><span><ChartNoAxesCombined size={17} /></span>Reports</div>
        </div>
        <div className={styles.phoneSectionTitle}>
          <strong>Recent activity</strong>
          <span>See all <ChevronRight size={12} /></span>
        </div>
        <div className={styles.transactionRow}>
          <span className={styles.rowIcon}><ShoppingBag size={17} /></span>
          <span className={styles.rowCopy}><b>Groceries</b><small>Food & drinks</small></span>
          <strong>-Rp 185,000</strong>
        </div>
        <div className={styles.transactionRow}>
          <span className={styles.rowIcon}><Coffee size={17} /></span>
          <span className={styles.rowCopy}><b>Coffee</b><small>Food & drinks</small></span>
          <strong>-Rp 35,000</strong>
        </div>
      </div>
      <PhoneNavigation active="home" />
      <div className={styles.homeIndicator} />
    </div>
  );
}

function SplitPhone() {
  return (
    <div className={`${styles.phone} ${styles.splitPhone}`}>
      <PhoneStatus />
      <div className={styles.phoneBody}>
        <div className={styles.phoneHeader}>
          <span className={styles.phoneAvatar}>S</span>
          <span className={styles.phoneGreeting}>Split a bill</span>
          <span className={styles.phoneHeaderIcon}><UsersRound size={17} /></span>
        </div>
        <div className={styles.splitIntro}>
          <span className={styles.splitIcon}><ReceiptText size={23} /></span>
          <p>Weekend dinner</p>
          <strong>Rp 480,000</strong>
          <span>3 people · 4 items</span>
        </div>
        <div className={styles.splitCard}>
          <div className={styles.splitCardHead}><strong>Who pays what</strong><span>Settled exactly</span></div>
          <div className={styles.personRow}><span className={styles.personAvatar}>A</span><b>Alex</b><strong>Rp 160,000</strong></div>
          <div className={styles.personRow}><span className={styles.personAvatar}>B</span><b>Ben</b><strong>Rp 160,000</strong></div>
          <div className={styles.personRow}><span className={styles.personAvatar}>C</span><b>Chris</b><strong>Rp 160,000</strong></div>
          <div className={styles.splitResult}><Check size={14} /><span>All shares add up to the bill</span></div>
        </div>
      </div>
      <PhoneNavigation active="split" />
      <div className={styles.homeIndicator} />
    </div>
  );
}

export function DesktopLanding() {
  return (
    <div className={styles.landing} lang="en">
      <header className={styles.header}>
        <Brand showLabel />
        <nav aria-label="Landing page" className={styles.headerNav}>
          <a href="#features">What it does</a>
          <a href="#get-started">How to start</a>
        </nav>
        <a className={styles.headerAction} href="#get-started">
          Try Spenles <ArrowUpRight aria-hidden="true" size={16} />
        </a>
      </header>

      <main>
        <section aria-labelledby="landing-title" className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1 id="landing-title">Make sense of your money, one day at a time.</h1>
            <p>
              Spenles is a personal finance app for your phone. Track what
              comes in, see what goes out, and share the costs that matter.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#get-started">
                Try Spenles on your phone <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className={styles.secondaryAction} href="#features">Explore the app <ArrowDownRight aria-hidden="true" size={17} /></a>
            </div>
            <div className={styles.heroAssurance}>
              <span><Check aria-hidden="true" size={14} /> Your own private account</span>
              <span><Check aria-hidden="true" size={14} /> Built for everyday IDR</span>
            </div>
          </div>

          <div className={styles.heroArtwork}>
            <div className={styles.artworkWord} aria-hidden="true">SPENLES</div>
            <div aria-hidden="true" className={styles.phoneStage}>
              <BalancePhone />
              <SplitPhone />
            </div>
            <span className={styles.previewNote}>Illustrative interface preview</span>
          </div>
        </section>

        <section aria-labelledby="features-title" className={styles.features} id="features">
          <div className={styles.featuresHeading}>
            <h2 id="features-title">The full picture starts with the everyday.</h2>
            <p>Spenles keeps your money routines connected, without turning them into accounting homework.</p>
          </div>
          <div className={styles.featureList}>
            <article>
              <span className={styles.featureIcon}><ReceiptText aria-hidden="true" size={21} /></span>
              <div><h3>Capture the moment</h3><p>Record income and expenses in a few taps, then find them again by account, category, or date.</p></div>
            </article>
            <article>
              <span className={styles.featureIcon}><ChartNoAxesCombined aria-hidden="true" size={21} /></span>
              <div><h3>Understand your month</h3><p>See cash flow, category spending, budgets, and reports in one place.</p></div>
            </article>
            <article>
              <span className={styles.featureIcon}><UsersRound aria-hidden="true" size={21} /></span>
              <div><h3>Make the split simple</h3><p>Assign items, include tax and service, and get a share for each person that adds up exactly.</p></div>
            </article>
          </div>
        </section>

        <section aria-labelledby="get-started-title" className={styles.getStarted} id="get-started">
          <div className={styles.getStartedIntro}>
            <span className={styles.mobileSymbol}><WalletCards aria-hidden="true" size={25} /></span>
            <h2 id="get-started-title">Made for the phone in your hand.</h2>
            <p>Use Spenles in your mobile browser, then add it to your home screen for quick access. Your financial data stays tied to your own account.</p>
          </div>
          <div className={styles.steps}>
            <div><span>1</span><p>Open this site on your phone.</p></div>
            <div><span>2</span><p>Create an account or sign in.</p></div>
            <div><span>3</span><p>Start with your first transaction.</p></div>
            <CopySiteLink />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Brand showLabel />
        <span>Personal finance, made easier to see.</span>
        <Link href="#get-started">Get started <ArrowRight aria-hidden="true" size={15} /></Link>
      </footer>
    </div>
  );
}
