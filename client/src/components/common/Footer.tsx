export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
        <nav className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </nav>
      </div>
    </footer>
  )
}
