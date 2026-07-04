'use client';

import { useThemeConfig } from '@/components/themes/active-theme';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Icons } from '../icons';
import { Kbd } from '@/components/ui/kbd';
import { THEMES } from './theme.config';

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        主题
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id='theme-selector'
          size='sm'
          className='h-8 gap-1 px-2 sm:h-9 sm:gap-2 sm:px-3 sm:*:data-[slot=select-value]:w-16'
        >
          <Icons.palette className='text-muted-foreground size-4' />
          <SelectValue className='hidden sm:flex' placeholder='主题' />
          <Kbd className='hidden sm:inline-flex'>T T</Kbd>
        </SelectTrigger>
        <SelectContent align='end'>
          {THEMES.length > 0 && (
            <SelectGroup>
              <SelectLabel>主题</SelectLabel>
              {THEMES.map((theme) => (
                <SelectItem key={theme.name} value={theme.value}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
