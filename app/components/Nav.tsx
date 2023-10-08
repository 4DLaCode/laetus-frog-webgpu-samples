import Link from "next/link";

export default function Nav() {
    return (
        <nav>
            <h2>Navigation</h2>
            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/samples/s000-triangle">S000 - Triangle</Link></li>
            </ul>
        </nav>
    )
}