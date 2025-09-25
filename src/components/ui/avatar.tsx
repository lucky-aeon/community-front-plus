import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@shared/utils/cn"
import { getAvatarUrl } from "@shared/utils/avatar"

type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  shape?: 'circle' | 'rounded' | 'square';
  framed?: boolean; // 是否添加浅描边白底相框
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number; // 统一尺寸映射或像素值
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, shape = 'circle', framed = false, size = 'md', style, ...props }, ref) => {
  const radiusCls = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-md' : 'rounded-xl';
  const frameCls = framed ? 'bg-white p-0.5 ring-1 ring-gray-200' : '';
  const sizeCls = (() => {
    if (typeof size === 'number') return '';
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      case 'xl': return 'h-16 w-16';
      case '2xl': return 'h-24 w-24';
      case 'md':
      default: return 'h-10 w-10';
    }
  })();
  const sizeStyle = typeof size === 'number' ? { width: size, height: size, ...style } : style;
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden",
        sizeCls,
        radiusCls,
        frameCls,
        className
      )}
      style={sizeStyle}
      {...props}
    />
  );
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, ...props }, ref) => {
  const resolvedSrc = React.useMemo(() => getAvatarUrl(src as string | undefined), [src]);
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={resolvedSrc}
      {...props}
    />
  );
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center bg-muted", className)}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
