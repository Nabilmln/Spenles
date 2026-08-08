import { eyebrowClass } from "@/components/ui/styles";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading max-w-[48rem]">
      {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
      <h1 className="mb-[.65rem] text-[clamp(1.75rem,4vw,2.35rem)] leading-[1.15] tracking-[-.04em]">
        {title}
      </h1>
      {description ? <p className="m-0 text-muted">{description}</p> : null}
    </div>
  );
}
