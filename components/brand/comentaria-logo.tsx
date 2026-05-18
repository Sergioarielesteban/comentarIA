export function ComentarIALogo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const textSize =
    size === "lg"
      ? "text-[2.25rem]"
      : size === "sm"
        ? "text-xl"
        : "text-[2rem]";

  return (
    <p
      className={`font-display font-semibold leading-none tracking-normal ${textSize}`}
    >
      <span className="text-ink">Comentar</span>
      <span className="text-terracotta">IA</span>
    </p>
  );
}
