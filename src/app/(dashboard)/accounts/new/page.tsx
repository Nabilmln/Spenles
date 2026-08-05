import { SectionHeading } from "@/components/layout/section-heading";
import { AccountForm, createAccountAction } from "@/modules/accounts";

export const metadata = { title: "Tambah akun" };

export default function NewAccountPage() {
  return (
    <div className="page-stack narrow-page">
      <SectionHeading eyebrow="Akun" title="Tambah akun" description="Semua akun menggunakan IDR." />
      <section className="card"><AccountForm action={createAccountAction} /></section>
    </div>
  );
}
