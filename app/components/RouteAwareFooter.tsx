import { PLATFORM_NAME } from "../../lib/brand";

const YOUTUBE_URL = "https://www.youtube.com/@%D8%A5%D8%B9%D8%B1%D8%A7%D8%A8%D9%83";
const WHATSAPP_URL = "https://wa.me/962799127434";

function YouTubeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11.4a8 8 0 0 1-11.8 7L4 19.5l1.1-4A8 8 0 1 1 20 11.4Z" />
      <path d="M9 8.5c.5 2.5 2 4 4.5 5" />
      <path d="m9 8.5 1.3-.6M13.5 13.5l.6-1.3" />
    </svg>
  );
}

export default function RouteAwareFooter() {
  return (
    <footer className="footer">
      <strong>© 2026 منصة {PLATFORM_NAME} — فاطمة علي الزوايدة</strong>

      <nav
        aria-label="روابط التواصل"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="قناة إعرابُك على YouTube"
          title="قناة إعرابُك على YouTube"
          style={{
            width: 38,
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid currentColor",
            borderRadius: 999,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <YouTubeIcon />
        </a>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="تواصل عبر WhatsApp على 0799127434"
          title="WhatsApp: 0799127434"
          style={{
            width: 38,
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid currentColor",
            borderRadius: 999,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <WhatsAppIcon />
        </a>
      </nav>
    </footer>
  );
}
