import { AccountForm, createAccountAction } from "@/modules/accounts";

export const metadata = { title: "Tambah akun" };

export default function NewAccountPage() {
  return (
    <div className="page-stack narrow-page">
      <p className="page-description">Semua akun menggunakan IDR.</p>
      <section className="card"><AccountForm action={createAccountAction} /></section>
    </div>
  );
}
