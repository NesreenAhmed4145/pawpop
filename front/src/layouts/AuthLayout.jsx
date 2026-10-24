import { Outlet } from 'react-router-dom';
import logo from '../../public/paw-logo.png';   // <-- 1) فكّي التعليق بعد ما تحطي اللوجو في src/assets

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-page px-3 py-6 sm:px-4 sm:py-14">
      <section className="w-full max-w-[460px] rounded-[10px] border border-line bg-surface px-5 pb-6 pt-7 shadow-card sm:px-9 sm:pb-8 sm:pt-9">
               <img src={logo} alt="pawpop" className="mx-auto mb-2 block h-auto w-[120px]" />


        <Outlet />
      </section>
    </main>
  );
}