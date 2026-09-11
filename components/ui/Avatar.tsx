import Image from 'next/image';
import { getDicebearAvatar, cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, username, size = 36, className }: AvatarProps) {
  const imgSrc = src || getDicebearAvatar(username || 'user');
  return (
    <div
      className={cn('rounded-full overflow-hidden flex-shrink-0 bg-[--primary]/10 relative', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={imgSrc}
        alt={username || 'avatar'}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        unoptimized={imgSrc.includes('dicebear')}
      />
    </div>
  );
}
