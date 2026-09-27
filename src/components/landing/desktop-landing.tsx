import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  CirclePlus,
  Coffee,
  Eye,
  Home,
  LockKeyhole,
  ReceiptText,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { CopySiteLink } from "./copy-site-link";
import styles from "./desktop-landing.module.css";

function PhoneStatus() {
  return (
    <div className={styles.phoneStatus}>
      <span>9:41</span>
      <span className={styles.phoneNotch} />
      <span className={styles.statusBars} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function PhoneNavigation({
  active,
}: {
  active: "home" | "budgets" | "reports";
}) {
  return (
    <div className={styles.phoneNavigation}>
      <span className={active === "home" ? styles.phoneNavActive : ""}>
        <Home size={16} />
        {active === "home" && "Home"}
      </span>
      <span>
        <WalletCards size={16} />
      </span>
      <span>
        <CirclePlus size={19} />
      </span>
      <span className={active === "budgets" ? styles.phoneNavActive : ""}>
        <ReceiptText size={16} />
        {active === "budgets" && "Budgets"}
      </span>
      <span className={active === "reports" ? styles.phoneNavActive : ""}>
        <ChartNoAxesCombined size={16} />
        {active === "reports" && "Reports"}
      </span>
    </div>
  );
}

function PhoneFrame({
  active,
  className,
  children,
}: {
  active: "home" | "budgets" | "reports";
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.phone} ${className}`}>
      <PhoneStatus />
      <div className={styles.phoneBody}>{children}</div>
      <PhoneNavigation active={active} />
      <span className={styles.homeIndicator} />
    </div>
  );
}

function PhoneHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={styles.phoneHeader}>
      <span className={styles.phoneAvatar}>S</span>
      <span className={styles.phoneGreeting}>{title}</span>
      <span className={styles.phoneHeaderIcon}>{icon}</span>
    </div>
  );
}

function BalancePhone() {
  return (
    <PhoneFrame active="home" className={styles.heroPhoneMain}>
      <PhoneHeader title="Good morning" icon={<WalletCards size={17} />} />
      <div className={styles.balanceCard}>
        <div className={styles.balanceTop}>
          <span>Total balance</span>
          <Eye size={15} />
        </div>
        <strong>Rp 8,450,000</strong>
        <p>
          <WalletCards size={13} /> All accounts
        </p>
        <div className={styles.balanceTotals}>
          <div>
            <small>Income</small>
            <b>Rp 12,000,000</b>
          </div>
          <div>
            <small>Expenses</small>
            <b>Rp 3,550,000</b>
          </div>
        </div>
      </div>
      <div className={styles.phoneQuickActions}>
        <div>
          <ArrowDownRight size={17} />
          Income
        </div>
        <div>
          <ArrowUpRight size={17} />
          Expense
        </div>
        <div>
          <ChartNoAxesCombined size={17} />
          Reports
        </div>
      </div>
      <div className={styles.phoneSectionTitle}>
        <strong>Recent activity</strong>
        <span>See all</span>
      </div>
      <div className={styles.transactionRow}>
        <span className={styles.rowIcon}>
          <ShoppingBag size={16} />
        </span>
        <span className={styles.rowCopy}>
          <b>Groceries</b>
          <small>Food & drinks</small>
        </span>
        <strong>-Rp 185,000</strong>
      </div>
      <div className={styles.transactionRow}>
        <span className={styles.rowIcon}>
          <Coffee size={16} />
        </span>
        <span className={styles.rowCopy}>
          <b>Coffee</b>
          <small>Food & drinks</small>
        </span>
        <strong>-Rp 35,000</strong>
      </div>
    </PhoneFrame>
  );
}

function ReportPhone() {
  return (
    <PhoneFrame active="reports" className={styles.heroPhoneLeft}>
      <PhoneHeader title="Reports" icon={<ChartNoAxesCombined size={17} />} />
      <div className={styles.phoneIntro}>
        <small>This month</small>
        <strong>See the whole picture.</strong>
        <span>Income and expenses, side by side.</span>
      </div>
      <div className={styles.reportPhoneCard}>
        <div className={styles.phoneCardLabel}>
          <span>Cash flow</span>
          <span>Last 6 months</span>
        </div>
        <div className={styles.miniChart} aria-hidden="true">
          {[44, 58, 49, 71, 61, 80].map((height, index) => (
            <div key={index}>
              <i style={{ height: `${height}%` }} />
              <b style={{ height: `${Math.max(24, height - 24)}%` }} />
            </div>
          ))}
        </div>
        <div className={styles.chartMonths}>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
        </div>
      </div>
      <div className={styles.phoneSummaryRow}>
        <span>Income</span>
        <b>Rp 12,000,000</b>
      </div>
      <div className={styles.phoneSummaryRow}>
        <span>Expenses</span>
        <b>Rp 3,550,000</b>
      </div>
      <div className={styles.phoneReportNote}>
        <ChartNoAxesCombined size={14} /> Your month, made readable
      </div>
    </PhoneFrame>
  );
}

function BudgetPhone() {
  return (
    <PhoneFrame active="budgets" className={styles.heroPhoneRight}>
      <PhoneHeader title="Budgets" icon={<ReceiptText size={17} />} />
      <div className={styles.phoneIntro}>
        <small>Monthly plan</small>
        <strong>Spend with intention.</strong>
        <span>Know what is left in each category.</span>
      </div>
      <div className={styles.budgetPhoneCard}>
        <div>
          <small>Budget remaining</small>
          <strong>Rp 1,550,000</strong>
        </div>
        <span className={styles.budgetPhoneTrack}>
          <i />
        </span>
        <div className={styles.budgetPhoneMeta}>
          <span>Used Rp 1,450,000</span>
          <span>of Rp 3,000,000</span>
        </div>
      </div>
      <div className={styles.budgetCategory}>
        <span className={styles.budgetCategoryIcon}>
          <ShoppingBag size={15} />
        </span>
        <div>
          <b>Groceries</b>
          <small>Rp 650,000 left</small>
        </div>
        <span>65%</span>
      </div>
      <div className={styles.budgetCategory}>
        <span className={styles.budgetCategoryIcon}>
          <Coffee size={15} />
        </span>
        <div>
          <b>Food & drinks</b>
          <small>Rp 340,000 left</small>
        </div>
        <span>43%</span>
      </div>
    </PhoneFrame>
  );
}

function InsightPreview() {
  const bars = [
    { month: "Apr", income: 58, expense: 34 },
    { month: "May", income: 67, expense: 41 },
    { month: "Jun", income: 63, expense: 38 },
    { month: "Jul", income: 75, expense: 47 },
    { month: "Aug", income: 70, expense: 43 },
    { month: "Sep", income: 86, expense: 50 },
  ];
  return (
    <div
      className={styles.insightPreview}
      aria-label="Illustrative report preview"
    >
      <div className={styles.insightPreviewHeader}>
        <div>
          <span>Monthly report</span>
          <strong>Income & expenses</strong>
        </div>
        <span>Sep 2026</span>
      </div>
      <div className={styles.insightTotals}>
        <div>
          <span>Income</span>
          <strong>Rp 12,000,000</strong>
        </div>
        <div>
          <span>Expenses</span>
          <strong>Rp 3,550,000</strong>
        </div>
      </div>
      <div
        className={styles.insightChart}
        aria-label="Illustrative six-month comparison"
      >
        {bars.map((bar) => (
          <div className={styles.insightChartColumn} key={bar.month}>
            <div className={styles.insightBarPair}>
              <i style={{ height: `${bar.income}%` }} />
              <b style={{ height: `${bar.expense}%` }} />
            </div>
            <span>{bar.month}</span>
          </div>
        ))}
      </div>
      <div className={styles.insightLegend}>
        <span>
          <i /> Income
        </span>
        <span>
          <i /> Expenses
        </span>
      </div>
      <div className={styles.insightCategory}>
        <div>
          <span>Spending by category</span>
          <strong>Food & drinks</strong>
        </div>
        <span>
          See breakdown <ArrowRight size={14} />
        </span>
      </div>
      <span className={styles.insightCaption}>Illustrative figures</span>
    </div>
  );
}

export function DesktopLanding() {
  return (
    <div className={styles.landing} lang="en">
      <header className={styles.header}>
        <Brand showLabel />
        <nav aria-label="Landing page" className={styles.headerNav}>
          <a href="#why-spenles">Why Spenles</a>
          <a href="#features">Features</a>
          <a href="#insights">Insights</a>
          <a href="#get-started">Get started</a>
        </nav>
        <a className={styles.headerAction} href="#get-started">
          Try Spenles <ArrowUpRight aria-hidden="true" size={16} />
        </a>
      </header>
      <main>
        <section aria-labelledby="landing-title" className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1 id="landing-title">Your money, clearly in view.</h1>
            <p>
              Spenles brings everyday spending, shared bills, budgets, and
              reports into one personal finance app for your phone.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#get-started">
                Try Spenles on your phone{" "}
                <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className={styles.secondaryAction} href="#features">
                Explore the features{" "}
                <ArrowDownRight aria-hidden="true" size={17} />
              </a>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroPhones} aria-hidden="true">
              <ReportPhone />
              <BalancePhone />
              <BudgetPhone />
            </div>
            <span className={styles.previewNote}>
              Illustrative interface previews
            </span>
          </div>
        </section>
        <section
          aria-labelledby="why-title"
          className={styles.why}
          id="why-spenles"
        >
          <div className={styles.sectionIntro}>
            <h2 id="why-title">A calmer way to stay close to your money.</h2>
            <p>
              It is easier to make everyday decisions when your records, plans,
              and shared costs live together.
            </p>
          </div>
          <div className={styles.whyGrid}>
            <article>
              <span className={styles.whyIcon}>
                <ReceiptText size={22} aria-hidden="true" />
              </span>
              <h3>See the everyday</h3>
              <p>
                Record income and expenses as they happen, then find each
                transaction by category, account, or date.
              </p>
            </article>
            <article>
              <span className={styles.whyIcon}>
                <ChartNoAxesCombined size={22} aria-hidden="true" />
              </span>
              <h3>Plan with context</h3>
              <p>
                Use budgets and monthly summaries to see how today&apos;s
                spending fits into the bigger picture.
              </p>
            </article>
            <article>
              <span className={styles.whyIcon}>
                <LockKeyhole size={22} aria-hidden="true" />
              </span>
              <h3>Keep it personal</h3>
              <p>
                Your financial records belong to your own account, with a
                separate space for every Spenles user.
              </p>
            </article>
          </div>
        </section>
        <section
          aria-labelledby="features-title"
          className={styles.features}
          id="features"
        >
          <div className={styles.sectionIntro}>
            <h2 id="features-title">The tools that earn their place.</h2>
            <p>
              Three useful ways to move from a list of transactions to a clearer
              plan.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <article className={styles.splitFeature}>
              <div className={styles.featureCopy}>
                <span className={styles.featureNumber}>01 / SPLIT BILLS</span>
                <h3>Settle the table, down to the last rupiah.</h3>
                <p>
                  Assign items to people, include tax and service, and get
                  shares that add up to the final bill.
                </p>
              </div>
              <div
                className={styles.splitDemo}
                aria-label="Illustrative split bill preview"
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
            </article>
            <article className={styles.budgetFeature}>
              <div className={styles.featureCopy}>
                <span className={styles.featureNumber}>02 / BUDGETS</span>
                <h3>Give your spending a plan.</h3>
                <p>
                  Set limits by category and see what remains as the month moves
                  on.
                </p>
              </div>
              <div
                className={styles.budgetDemo}
                aria-label="Illustrative budget preview"
              >
                <div>
                  <span>Food & drinks</span>
                  <strong>Rp 340,000 left</strong>
                </div>
                <span className={styles.budgetDemoTrack}>
                  <i />
                </span>
                <small>Rp 460,000 of Rp 800,000 used</small>
              </div>
            </article>
            <article className={styles.reportFeature}>
              <div className={styles.featureCopy}>
                <span className={styles.featureNumber}>03 / REPORTS</span>
                <h3>See the story behind the numbers.</h3>
                <p>
                  Review cash flow, category spending, and income against
                  expenses, then export a PDF report.
                </p>
              </div>
              <div
                className={styles.reportDemo}
                aria-label="Illustrative report preview"
              >
                <div>
                  <span>Monthly cash flow</span>
                  <ChartNoAxesCombined size={17} />
                </div>
                <div className={styles.reportDemoBars}>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <span>
                  Apr <b>May</b> Jun <b>Jul</b> Aug <b>Sep</b>
                </span>
              </div>
            </article>
          </div>
          <div className={styles.moreFeatures}>
            <span>And the essentials, too</span>
            <ul>
              <li>Income & expense tracking</li>
              <li>Accounts & transfers</li>
              <li>Custom categories</li>
              <li>Personal data backup</li>
            </ul>
          </div>
        </section>
        <section
          aria-labelledby="insights-title"
          className={styles.insights}
          id="insights"
        >
          <div className={styles.insightsCopy}>
            <span className={styles.insightsLabel}>INSIGHTS & REPORTS</span>
            <h2 id="insights-title">Understand more than your balance.</h2>
            <p>
              See how income and expenses move across the months. Find where
              money went by category and turn the details into a report you can
              revisit.
            </p>
            <ul>
              <li>
                <Check size={17} /> Compare income with expenses
              </li>
              <li>
                <Check size={17} /> Review cash flow and category spending
              </li>
              <li>
                <Check size={17} /> Export a personal PDF report
              </li>
            </ul>
          </div>
          <InsightPreview />
        </section>
        <section
          aria-labelledby="get-started-title"
          className={styles.getStarted}
          id="get-started"
        >
          <div className={styles.getStartedIntro}>
            <h2 id="get-started-title">Start on the phone in your hand.</h2>
            <p>
              Open Spenles in your mobile browser. After signing in, you can add
              it to your home screen for quick access.
            </p>
          </div>
          <div className={styles.steps}>
            <div>
              <span>1</span>
              <p>Open this site on your phone.</p>
            </div>
            <div>
              <span>2</span>
              <p>Create an account or sign in.</p>
            </div>
            <div>
              <span>3</span>
              <p>Record your first transaction.</p>
            </div>
            <CopySiteLink />
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <Brand showLabel />
        <span>Personal finance, made easier to see.</span>
        <a href="#get-started">
          Get started <ArrowRight aria-hidden="true" size={15} />
        </a>
      </footer>
    </div>
  );
}
