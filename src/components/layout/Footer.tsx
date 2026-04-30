export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} Все права защищены.</p>
      </div>
    </footer>
  );
}
