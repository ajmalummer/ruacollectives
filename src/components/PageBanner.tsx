interface PageBannerProps {
  title: string;
  image: string;
}

export default function PageBanner({ title, image }: PageBannerProps) {
  return (
    <div className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden pt-16">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center px-4">
        <h1 className="font-playfair text-4xl sm:text-5xl text-foreground">{title}</h1>
      </div>
    </div>
  );
}
