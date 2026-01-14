
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SWRegistrar from '../SWRegistrar';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();              
  const token = cookieStore.get('token')?.value;    

  if (!token) {
    redirect('/');
  }
  return <>
    <SWRegistrar />
    {children}
  </>;
}
