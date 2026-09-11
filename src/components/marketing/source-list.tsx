type SourceListProps = {
  items: Array<{
    title: string;
    description?: string;
  }>;
};

export function SourceList({ items }: SourceListProps) {
  return (
    <div className="rounded-surface bg-white p-6">
      <h3 className="text-xl font-semibold">Источники и проверка</h3>
      <ul className="mt-5 flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
        {items.map((item) => (
          <li key={item.title} className="border-l-2 border-brand-coral pl-4">
            <span className="block font-semibold text-foreground">{item.title}</span>
            {item.description ? <span>{item.description}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
