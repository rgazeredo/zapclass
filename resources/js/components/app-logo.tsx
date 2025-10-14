export default function AppLogo() {
    return (
        <>
            {/* Light theme logo */}
            <img src="/logo-black-blue.png" alt="ZapClass" className="block max-h-14 dark:hidden" />
            {/* Dark theme logo */}
            <img src="/logo-white-blue.png" alt="ZapClass" className="hidden max-h-14 dark:block" />
        </>
    );
}
