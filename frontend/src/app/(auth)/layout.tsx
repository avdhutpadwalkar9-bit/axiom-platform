/* (auth) route group layout. Pulls in the design-system tokens via
   app-shell.css (re-used so the variables match the rest of the app
   exactly) and the split-screen-specific styles via auth.css.
   No JSX shell — each page renders its own .auth-wrap. */
import "../(app)/app-shell.css";
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
