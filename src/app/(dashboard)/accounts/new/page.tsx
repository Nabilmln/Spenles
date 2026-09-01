import { cardClass, narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import { AccountForm, createAccountAction } from "@/modules/accounts";

export default function NewAccountPage() {
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>All accounts use IDR.</p>
      <section className={cardClass}><AccountForm action={createAccountAction} /></section>
    </div>
  );
}
