// Login page has its own layout that does NOT use AppShell
// so that unauthenticated users see a clean page without the sidebar/header
export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
