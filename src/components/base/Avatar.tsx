import React from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const px = { sm: 32, md: 40, lg: 48 };

  const getInitials = (n: string) => {
    const parts = n.split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
      {src ? (
        <Image src={src} alt={alt || name || "Avatar"} width={px[size]} height={px[size]} className="object-cover" />
      ) : (
        <span className="font-medium text-gray-600">{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
};

