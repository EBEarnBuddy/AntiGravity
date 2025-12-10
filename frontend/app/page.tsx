import { redirect } from 'next/navigation';
import LanderPage from './lander/page';

export default function Home() {
  // Option 1: Redirect to /lander
  // redirect('/lander');

  // Option 2: Render Lander directly (better for SEO/UX as root)
  return <LanderPage />;
}
