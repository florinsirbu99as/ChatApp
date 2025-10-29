
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();              
  const token = cookieStore.get('token')?.value;    

  if (!token) {
    redirect('/');
  }
  return <>{children}</>;
}
