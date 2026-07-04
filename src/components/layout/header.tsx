import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { ThemeSelector } from '../themes/theme-selector';

export default function Header() {
  return (
    <header className='bg-background/60 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-md md:h-14'>
      <div className='flex min-w-0 flex-1 items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1 shrink-0' />
        <Separator orientation='vertical' className='mr-2 h-4 shrink-0' />
        <Breadcrumbs />
      </div>

      <div className='flex shrink-0 items-center gap-1 px-2 sm:gap-2 sm:px-4'>
        <ThemeSelector />
        <ThemeModeToggle />
      </div>
    </header>
  );
}
